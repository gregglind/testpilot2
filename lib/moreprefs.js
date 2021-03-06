/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*  MPL 2.0 

This is a shim until iterability in keys  (/pull/300) comes through

*/

"use strict";

const {Cc,Ci,Cr} = require("chrome");
const { id } = require("self");
const myprefs = require("simple-prefs").prefs;

const prefService = Cc["@mozilla.org/preferences-service;1"].
                getService(Ci.nsIPrefService);
const defaultBranch = prefService.getDefaultBranch(null);

const ADDON_BRANCH = "extensions." + id + ".";

var allprefs = exports.allprefs = function(substring,base) {
    if (base === undefined) base = ADDON_BRANCH;
    
    let prefSvc = prefService.getBranch(base);
    let out = {};
    prefSvc.getChildList(substring).forEach(
        function(pref) { 
            out[pref] = myprefs[pref]; 
        }
    );
    return out;
};


  
  
  