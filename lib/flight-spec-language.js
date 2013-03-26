/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let {validateOptions, validateWithOptional, optional, getTypeOf} = require('validation-utils');
let {validFlightPlan} = require("flight-plan-language").validate;

/*
{  studyname:  feature-studyversion-(os-locale)-version,
   author:
   description:
   flightplan:  [see below],
   endBy:  ts   // another kill switch.  if not completed within this time frame, 'kill'
   stopflight: bool   // if true, end/trash any existing studies, removing any addon, flight status to 'killed'
   infourl:   // link to describe the study, risks, etc.?
   version: 1  // of the recipe spec?  of the study?
   filter:      // run iff match
        - channels
        - oses
        - locales
        - (etc?)
   randomsubset:   // after filter!
    - key:
    - range:
}
*/

let NonEmptyString = function(key){
  return {
    is: ["string"],
    ok: function (val) val.length > 0,
    msg: key + " must be a non-empty string."
  }
};

/* time diff OR ts  OR date string */
let ValidEndTime = function(key){
  return {
      is:  ['string','number',"object"],
      map: function (val) val,
      ok:  function (val) {
          switch (getTypeOf(val)) {
            case "number":
              return val > 0
            case "string":
              return new Date(val)
            case "object":
              return object.value !== undefined && object.value > 0
            default:
              return false
          }
      },
      msg: key +" must be time-ish"
    }
};

let ValidRandomDeploy = function(key){
  return function(val){
    let randomSpec = {
      key: NonEmptyString("randomSpec"),
      range: {
        is:  ["array"],
        map: function (val) {
          val = Array(val);
          val = [Number(val[0]), Number(val[1])]
          return val
        },
        ok:  function (val) val.length == 2 && (0 <= val[0] < val[1] <= 1),
        msg: key + " must be numeric array of length 2 with 0 <= v[0] < v[1] <= v[1]"
      }
    }
    return validateOptions(val,randomSpec)
  }
}

let ArrayOf= function(type){
  return function(thing){
    return getTypeOf(thing) == "array" &&
           thing.every(function(x) getTypeof(x) == type)
  }
};

/* TODO (glind)  beef this up */
let ValidFilter = function(key){
  return function(val){
    let FilterSpec = {
      os: {ok: ArrayOf("string")},
      locale:  {ok: ArrayOf("string")},
      version: {ok: ArrayOf("string")},
      addon:  {ok: ArrayOf("string")}
    }
    return validateOptions(val,filterSpec)
  }
};

/* TODO (glind) improve this */
let ValidURL = function(key) NonEmptyString(key);

let FlightSpecLanguage = exports.FlightSpecLanguage = {
    name: NonEmptyString("name"),
    author: optional(NonEmptyString("author")),
    description: optional(NonEmptyString("description")),
    flightplan: optional({ ok: validFlightPlan }),
    end: ValidEndTime("end"),
    stopflight: optional({"is": ["boolean"]}),
    infourl: optional(NonEmptyString("infourl")),
    specversion: optional({is: ['number'], ok: function(val) val > 0}),
    filter: optional(ValidFilter("filter")),
    randomsubset: optional(ValidRandomDeploy("randomdeploy"))
};

let validate = exports.validate = function(options) validateWithOptional(options,FlightSpecLanguage);
