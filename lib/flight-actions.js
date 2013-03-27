/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { tplog } = require("tputils");
const { defer, promised, resolve } = require("sdk/core/promise");
const { observer } = require("sdk/system/events");
const { Request } = require("request");

let timers = require("timers");

let addon = function(options,that){
	let {promise,resolve,reject} = defer();
	timers.setTimeout(function(){
		tplog("addon added!", time, Date.now());
		resolve();
	},time);
	return promise;
};

let ask = function(options,that){
	let {promise,resolve,reject} = defer();
	console.log("asking!");
	console.log(JSON.stringify(that.spec,null,2))
	timers.setTimeout(resolve,100);
	return promise;
};

let emitevent = function(options,that){
	let {topic,subject,data} = options;
  return resolve(observer.emit(topic,{subject:subject,data:data}))
};

let instrument = function(){
	let {promise,resolve,reject} = defer();
	timers.setTimeout(function(){
		tplog("instrument made!", time, Date.now());
		resolve();
	},time);
	return promise;
};

let log = function(options,that){
	let {msg} = options();
	// will eventually have a 'resolve this as template' and other options
	tplog(msg);
	return resolve();
};

let observe = function(options,that){
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

let ping = function(options,that){
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

let wait = function(options,that){
	let {promise,resolve,reject} = defer();
	let {time} = options;
	tplog("about to wait", time, Date.now());

	timers.setTimeout(function(){
		tplog("waited", time, Date.now());
		resolve();
	},time);
	return promise;
};

["addon","ask","emitevent","instrument","log","observe","ping","wait"]

let here = this;
let actions = exports.actions = {};
["addon","ask","emitevent","instrument","log","observe","ping","wait"].forEach(function(x){
	{actions[x] = here[x]}
});

console.log(Object.keys(exports.actions))