/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const appname = require("xul-app").name;

let stub;
switch (appname) {
    case "Firefox":
        console.log(Object.keys(require("askuser-desktop")));
        stub = require("askuser-desktop");
        break;
    case "Fennec":
        stub = require("askuser-mobile");
        break;
    default:
        throw Error("no ui available on platform: " + appname);
};

for (let k in stub){
    exports[k] = stub[k]
}