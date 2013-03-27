/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let {validateOptions, getTypeOf} = require('sdk/deprecated/api-utils');

/* if requirements[key] has 'optional', then check it.

	key appears in returned IFF it actually was checked.
  */
let validateWithOptional = exports.validateWithOptional = function(options,requirements) {
	options = options || {};
  let cleaned = {};
  let newrequirements = {}

  for (let key in requirements) {
    let req = requirements[key];
    let [optsVal, keyInOpts] = (key in options) ?
                               [options[key], true] :
                               [undefined, false];
  	if (req.optional && !keyInOpts) {
  	} else {
  		cleaned[key] = options[key];
  		newrequirements[key] = req;
  	}
  }
  return validateOptions(cleaned,newrequirements)
}


let optional = exports.optional = function(req){
	req.optional = true;
	return req
}


// pass through
exports.validateOptions = validateOptions;
exports.getTypeOf = getTypeOf;