
"use strict";
const { promised, defer, resolve } = require("sdk/core/promise");
const { Class } = require('sdk/core/heritage');
const { validateOptions : validate } = require('sdk/deprecated/api-utils');
const { setTimeout } = require("timers");

let ohno = function() console.error("crud!");

let Flight = Class({
	initialize: function(config){
		// see if I already have one with that name.
		// if so, go to heck, unless kill
		// validate the config?
		this.config = config;
		this.steps = [];
	},
	kill: function(){
		// run whatever cleanups there are.
	},
	attempt: function(flightplan){
		let that = this;
		let steps = [];
		//this.doAct({},100);
		//let {promise,resolve, reject} = defer();
		let promise = resolve(1);
		flightplan.forEach(function(act,ii){
			console.log(ii)
			// if not already done
			// do all subparts
			promise = promise.then(function() that.doAct2(act,ii,that));
			//promise = promise.then(function(value) { return value + 1 })
		})
		return promise;
	},

	doActList: function(actions){
		// TODO Finish
		// see if it's an array or a straight obj?
		let args = []
		//
		promised(Array)()
	},
	doAct: function(act,ii,that){
		console.log("doing act", ii);
		this.steps[ii] = Date.now();
		return true;
	},
	doAct2: function(act,ii,that){
		let {promise,resolve,reject} = defer();
		if (that.steps[ii] !== undefined){
			console.log("step", ii, "already done!  at ", this.steps[ii]);
			resolve();
		} else {
			setTimeout(function(){
				console.log("doing act2", ii);
				that.steps[ii] = Date.now();
				resolve();
			},10)
		}
		return promise
	}
})

exports.main = function(){
	var a = resolve(5).then(function(value) {
	  return value + 2
	});
	a.then(console.log);  // => 7

	let F = Flight();
	let flightplan = [{},{},{},{}]
	//F.attempt(flightplan).then(console.log);
	F.attempt(flightplan).then(function(){
		console.log(F.steps);
		// do it again, with same plan!
		F.attempt(flightplan).then(function(){console.log(F.steps)}).then(null,ohno);
	});


}

