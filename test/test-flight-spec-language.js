/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let {validate} = require("flight-spec-language");

let good_plans = [
[{
	name:  "a flight plan",
	end: 86400 * 1000 * 30
}, "minimal valid plan, int end point"],
[{
	name:  "a flight plan",
	end: "11 March 2020"
}, "minimal valid plan, date end point"]
];


let bad_plans = [
[{
	name:  1
}, "flight name not a string"],
[{
	name:  "a"
}, "flight no end time"]
];

exports['test good plans'] = function(assert){
	good_plans.forEach(function(k){
		let plan = k[0];
		let msg = k[1];
		assert.ok(validate(plan),msg);
	})
};


exports['test bad plans'] = function(assert){
	bad_plans.forEach(function(k){
		let plan = k[0];
		let msg = k[1];
		assert.throws(function(){validate(plan)},msg);
	})
};

require("test").run(exports);