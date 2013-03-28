/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let {has} = require('sdk/util/array');
const { Class, mix } = require('sdk/core/heritage');
const { defer, promised } = require("sdk/core/promise");
const { emit, on, once, off } = require('sdk/event/core');
const { EventTarget } = require('sdk/event/target');
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;
const {storage} = require("simple-storage");
const timers = require("timers");

const {codeok, ohno, schedule, tplog} = require('tputils');
//const {Study,survey_defaults,experiment_defaults,revive} = require("study");
const {Flight} = require("flight");
let {validate} = require("flight-spec-language");


let airborne = {}; // for actual live instances of Flight() objects;

/**
  Storage of flights between uses / serializing configs etc.
  */
let hangar = function(){
  	if (storage.flights === undefined) storage.flights = {};
		return storage.flights;
};

let FlightController = exports.FlightController = Class({
	initialize: function(){
	},

	start: function(){
    let timeout = 3600 * 1000 // 1 hr
    let that = this;

    let scheduleObject = schedule(timeout, function(){
      that.monitor().then(again,again)
    });

    let again = function() that._monitortimer = scheduleObject.start()

    tplog("first start");
    that.monitor().then(again,again);
    return this;
  },

  stop:  function(){
    if (this._monitortimer) timers.clearTimeout(this._monitortimer);
    return this;
  },

  monitor: function(url){
    tplog("monitor");
    let { promise, resolve, reject } = defer();
    url = url || myprefs['indexurl'];
    if (!url) {tplog('setup and run: no url given'); reject();}

    downloadFlightConfig(url).then(
      validate_studies).then(
      runFlights).then(
        resolve,
        function(err){
          ohno(err);
          resolve();
        }
      );
    return promise
  }
});

/* get the json
*/
let downloadFlightConfig = function(url) {
  let { promise, resolve, reject } = defer();
  tplog('downloading',url);
  Request({
    url: url,
    onComplete: function (response) {
      if (!codeok(response.status) ||  !response.json) {
        tplog("getJson bad status (",response.status,") OR no response.json");
        reject();
      }
      for (var headerName in response.headers) {
        tplog(headerName + " : " + response.headers[headerName]);
      }
      myprefs['lastdownload'] = '' + Date.now();
      resolve(response.json)
    }
  }).get();
  return promise;
}
/**
  */
let validate_studies = function(studylist) {
		tplog("Checking experiments for validity");
    tplog(JSON.stringify(studylist,null,2));
    studylist = studylist.map(validate);
    return studylist;
};


var decide_arm = function(multiarm_config,callback) {
		// return a study?  should this roll into run_or_not?
		// get user info here?
		// see which 'arm' matches first...
		// some default 'rules' here?
};


let revive = exports.revive = function(){
  let flights = hangar();
  tplog(JSON.stringify("revive these flights:",flights))
  for (let k in flights) {
    attemptFlight(flights[k].spec)
  }
}

let runFlights = function(specs){
  promised(Array).call(specs.map(attemptFlight)).then(
    function(){tplog("all flights attempted")},
    function(err){ohno("runFlight",err)}
  )
};

let attemptFlight = function(spec){
  tplog("attempting",JSON.stringify(spec))
  let { promise, resolve, reject } = defer();
  let known = hangar();
  let {name,plan} = spec;
  let d = known[name];
  if (!d){
    tplog("attempting:neverseen:",name);
    // TODO (glind), this need a validator / spec!
    known[name] = d = {spec:spec, status:'running',firstseen: Date.now(), results: {act:[],clean:[]}}
  }

  if (airborne[name])
    if (spec.stopflight) {
      tplog("airborne:killing:", name);
      return airborne[name].stopflight();
    }
    else {
      tplog("airborne:continuing", name);
    }
  else {
    let status = known[name].status;
    if (has(['complete','cleaned'],status)){
      tplog("airborne:allow-stay-unrun", name, status );
    } else {
      tplog("airborne:starting:",name);
      airborne[name] = Flight(d);
      // if cleaning, keep cleaning!
      airborne[name].attempt(spec.plan,status=="cleaning").then(delete airborne[name], ohno);
    }
  }
  return promise
}