/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { defer, promised, resolve } = require("sdk/core/promise");
const { observer } = require("sdk/system/events");
const { Request } = require("request");
const timers = require("timers");

const { tplog } = require("tputils");
const { validators } = require("flight-plan-language");

const askuser = require("askuser");

/* install, track with extension tracker */
let addon = function(options,that){
	options = validators['addon'](options);
	let {promise,resolve,reject} = defer();
	timers.setTimeout(function(){
		tplog("addon added!", time, Date.now());
		resolve();
	},time);
	return promise;
};


/* ask is all message boxes, or whatnot.... surveys, upload, etc. */
let ask = function(options,that){
	options = validators['ask'](options);
	let {promise,resolve,reject} = defer();
	console.log("asking!");
	askuser[options.type](options,that).then(resolve,function(err){
		tplog("GOT REJECTED FOR ASK");
		reject();
	}) // a promise
	return promise;
};

/* emit an observer event*/
let emitevent = function(options,that){
	options = validators['emitevent'](options);
	let {topic,subject,data} = options;
  return resolve(observer.emit(topic,{subject:subject,data:data}))
};

/* eventually, a micropilot study */
let instrument = function(){
	options = validators['instrument'](options);
	let {promise,resolve,reject} = defer();
	timers.setTimeout(function(){
		tplog("instrument made!", time, Date.now());
		resolve();
	},time);
	return promise;
};

/* just log to console, useful for devs */
let log = function(options,that){
	options = validators['log'](options);
	let {msg} = options;
	// will eventually have a 'resolve this as template' and other options
	tplog(msg);
	return resolve();
};

/* either a global observer, OR a jquery-ish selector on a url whatever */
let observe = function(options,that){
	options = validators['observe'](options);
	let {promise,resolve,reject} = defer();
	let {topic,subject} = options;
	let cb = function(evt){
		if (subject === undefined) {
			resolve()
		} else {
			if (subject == evt.subject){
			resolve()
			}
		}
	}
	observer.once(topic,cb);
	return promise
};

/* send an http GET request */
let ping = function(options,that){
	options = validators['ping'](options);
	let {promise,resolve,reject} = defer();
	let {url} = options;
	// will eventually have a 'resolve this as template' and other options
	Request({
		url: url,
		onComplete: function(response){
			resolve();
		}
	}).get();
	return promise;
};

/* wait for a period, or until after ts, from lifetime of study, will use Fuse */
let wait = function(options,that){
	options = validators['wait'](options);
	let {promise,resolve,reject} = defer();
	let {time} = options;
	tplog("about to wait", time, Date.now());

	timers.setTimeout(function(){
		tplog("waited", time, Date.now());
		resolve();
	},time);
	return promise;
};


let undo_addon = function(options,that){
	return resolve(1)
};
let undo_ask = function(options,that){
	that.openui.forEach(function(k){
		if (k) { k.destroy() }   // good enough for now.
	})
	return resolve(1)
};
let undo_emitevent = function(options,that){
	return resolve(1)
};
let undo_instrument = function(options,that){
	return resolve(1)
};

let undo_log = function(options,that){
	return resolve(1)
};
let undo_observe = function(options,that){
	return resolve(1)
};
let undo_ping = function(options,that){
	return resolve(1)
};
let undo_wait = function(options,that){
	return resolve(1)
};


let here = this;
let actions = exports.actions = {};
let undo = exports.undo = {};
["addon","ask","emitevent","instrument","log","observe","ping","wait"].forEach(function(x){
	actions[x] = here[x];
	undo[x] = here["undo_" + x];
});



