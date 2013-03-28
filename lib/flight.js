"use strict";

const { Class, mix } = require('sdk/core/heritage');
const { Collection } = require("collection");
const data = require('self').data;
const { defer, promised, resolve } = require("sdk/core/promise");
const { emit, on, once, off } = require('sdk/event/core');
const { EventTarget } = require('sdk/event/target');
const observer = require("observer-service");
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;
const timers = require("timers");
const { has } = require('array');

const { extensiontracker } = require("extensiontracker");
const { ohno, tplog, urlize_addon_path } = require("tputils");

const { actions, undo } = require("flight-actions");


console.log(Object.keys(undo));
console.log(Object.keys(actions));

/*
  flights need to know:
  * spec
  * results of each step
  * status
  * result / progress of cleanup (to keep retrying)
  * ??

  STATUS is:

  * running
  * complete
  * cleaning
  * clean

*/
let Flight = exports.Flight = Class({
    initialize: function(d){
        // see if I already have one with that name.
        // if so, go to heck, unless kill
        // validate the config?
        this.meta = d;
        this.spec = d.spec;
        this.openui = [];
    },
    /* cleanup: boolean... cleanup instead of do.... TODO boolean, arg, really? */
    attempt: function(flightplan,cleanup){
      let word = ["act","clean"][Number(!!cleanup)];

      flightplan = flightplan || this.spec.flightplan || [];
      tplog("Flight:attemping:"+word, this.spec.name)

      let that = this;
      let promise = resolve(1);
      flightplan.forEach(function(act,ii){
          tplog("promising", word ,ii, that.spec.name)
          // if not already done
          // do all subparts
          // promise = promise.then(function() that.doAct(act,ii,that));
          promise = promise.then(function() that.doAct(act,ii,that,cleanup));
      })

      promise = promise.then(function() {
        tplog("Flight:"+word, that.spec.name,"all steps completed");
        that.meta.status = ['complete','clean'][Number(!!cleanup)]
      }, function(err){
        tplog("Flight:"+word+"failure:", err, that.spec.name);
        !cleanup && that.stopflight();
        ohno(err);
      })
      return promise;
    },
    doActList: function(actionList){
        promised(Array)()
    },
    doAct: function(act,ii,that,cleanup){
      let word = ["act","clean"][Number(!!cleanup)];
      let actmap = [actions,undo][Number(!!cleanup)];

      tplog("doing:"+word,that.spec.name, ii, Date.now())
      let results = that.meta.results;
      let {promise,resolve,reject} = defer();
      if (results[word][ii] !== undefined){
        tplog("step", ii, this.spec.name, "already done!  at ", results[word][ii]);
        resolve();
      } else {
        tplog("doAct:"+word,act.action);
        actmap[act.action](act,that).then(function(){
          results[word][ii] = Date.now();
          resolve()
        }, function() {reject(ii)})
      }
      return promise
    },
    stopflight: function(){
        // for each step, undo.
        this.meta.status = 'cleaning'
        let undo=true;
        this.attempt(this.spec.plan,undo); // UGH, boolean!
    }
});
