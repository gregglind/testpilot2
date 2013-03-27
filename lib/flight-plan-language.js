/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let {validateOptions, validateWithOptional, optional, getTypeOf} = require('validation-utils');

let actionOptions = {};

let FlightPlanElement = exports.FlightPlanElement = function(v){
	{
		action: { is: ['string']} // for now
	}
};

let ask_valid = function(){

};

let validate = exports.validate = function(plan) {
	return getTypeOf(plan) == "array" &&
		plan.every(function(k){
			switch (getTypeOf(k)){
				case "array":
					k.every(function(parallel){
						return getTypeOf(parallel) == "object"  // for now!
					})
				case "object":
					return true
				default:
					return false
			}
		})
}

let validators = exports.validators = {};
["ask"].forEach(function(k){
	validators[k] = module[k+"_valid"]
});

