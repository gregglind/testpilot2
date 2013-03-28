/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let { tplog, ohno } = require("tputils");
let { validateOptions, validateWithOptional, optional, getTypeOf, oneof } = require('validation-utils');

let actionOptions = {};

let directives = ["addon","ask","emitevent","instrument","log","observe","ping","wait"];

let FlightPlanElement = {
	action: {
		is: ['string'],
	  ok: oneof(directives)
	} // for now
};

let addon_valid = function(x){
	/*
		ensure, url
	*/
	return x;
};

let ask_valid = function(x){
	/*
		type:  survey, warn, tell, upload?
	*/
	return x;
};

let emitevent_valid = function(x){
	//
	return x;
};

let instrument_valid = function(x){
	// same as instrument_options!
	return x;
};

let log_valid = function(x){
	// msg or err, but not both which will be run through template
	return x;
};

let observe_valid = function(x){
	// global message (v1), OR (urlregex,ids,actions), where any will do it. (v2)
	return x;
};

let ping_valid = function(x){
	// url, get|post, fields?
	return x;
};

let wait_valid = function(x){
	// ts, etc.
	return x;
};

let validate = exports.validate = function(plan) {
	return getTypeOf(plan) == "array" &&
		plan.every(function(k){
			switch (getTypeOf(k)){
				case "array":
					k.every(function(parallel){
						getTypeOf(parallel) == "object" && validateOptions(parallel, FlightPlanElement) // for now!
					})
				case "object":
					return validateOptions(parallel, FlightPlanElement) // for now!
				default:
					return false
			}
		})
}

let validators = exports.validators = {};
let here = this;
directives.forEach(function(k){
	validators[k] = here[k+"_valid"]
});


