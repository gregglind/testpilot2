/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { defer, promised, resolve } = require("sdk/core/promise");
const self = require("self");

const { tplog, ohno } = require("tputils");
const { Panel } = require("tppanel");
const { anchorit, switchtab } = require("ui-utils");

/**
  */
let templated = function(url,that){
	// should this be in this file?  utils?  part of a flight?
	// fill in OS, lang, etc in urls.
	// FOR NOW, STUB
	return url
}

let survey = exports.survey = function(options,that){
	// this is all mangled together, for the moment.
	let surveyurl = templated("http://zooborns.com/",that); // should be template.
	let infourl = templated("http://mozilla.com/",that); // should be template.

	let {promise,resolve,reject} = defer();
  let pagedata = {
      title: "Take this survey!",
      subtitles: [that.spec.name],
      icon: self.data.url("img/testPilot_200x200.png"),
      content: ["Para1 is a good para.", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
      	"Help us out to do something awesome."],
      buttons: [
          {text: "yes",
          action: "yes"},
          {text: "maybe later",
          action: "later"},
          {text: "noooooooo!",
          action: "no"},
          {text: "close window",
          action: "close"},
      ]
  };
	let p = Panel({
		width: 500,
		height: 400,
		contentURL:  self.data.url("notification.html"),
    contentScriptOptions:  {pagedata: pagedata},
    contentScriptFile: [self.data.url("js/jquery.min.js"),
                      self.data.url("js/underscore-min.js"),
                      self.data.url("js/notification.js")],
    contentScriptWhen: 'ready',
  });

	p.port.emit("customize");
  p.port.on("resize", function(d) {p.resize(d[0],d[1])})
  p.port.on("action", function(data) {
    console.log('got action!');
    console.log(JSON.stringify(data));

    if (!data.data.action) return

    switch (data.data.action) {
      case "close":
        p.destroy();  // I claim closing the window isn't a true rejection.
        break;
      case "yes":
      	switchtab(surveyurl);
    		resolve();
        p.destroy();
    		break;
      case "moreinfo":
      	switchtab(infourl);
    		break;
      case "no":
    		p.destroy();
        tplog("saying no survey")
    		reject(); // causes that.meta.status = "killed"; // or such... need to say 'call the cleanup'.
    		break;
      case "later":
      	// save it for later?  should go to "later stuff" icon?
      	p.destroy();
      default:
      	break;
    }
  });

  that.openui.push(p);
  p.show(anchorit(),{persistent:true});
  return promise;

};


let warn = exports.warn = function(options,that){
	// this is all mangled together, for the moment.
	let infourl = templated("http://mozilla.com/",that); // should be template.

	let {promise,resolve,reject} = defer();
  let pagedata = {
      title: "Warning!",
      subtitles: [that.spec.name],
      icon: self.data.url("img/testPilot_200x200.png"),
      content: ["Something potentally terrible is about to happen.", "press okay to continue."],
      buttons: [
          {text: "yes",
          action: "yes"},
          {text: "more info",
          action: "moreinfo"},
          {text: "maybe later",
          action: "later"},
          {text: "noooooooo!",
          action: "no"},
      ]
  };
	let p = Panel({
		width: 500,
		height: 400,
		contentURL:  self.data.url("notification.html"),
    contentScriptOptions:  {pagedata: pagedata},
    contentScriptFile: [self.data.url("js/jquery.min.js"),
                      self.data.url("js/underscore-min.js"),
                      self.data.url("js/notification.js")],
    contentScriptWhen: 'ready',
  });

	p.port.emit("customize");
  p.port.on("resize", function(d) {p.resize(d[0],d[1])})
  p.port.on("action", function(data) {
    console.log('got action!');
    console.log(JSON.stringify(data));

    if (!data.data.action) return

    switch (data.data.action) {
      case "yes":
    		resolve();
        p.destroy();
    		break;
      case "moreinfo":
      	switchtab(infourl);
    		break;
      case "no":
        tplog("yo, rejecting!", that.spec.name);
    		reject(); // causes that.meta.status = "killed"; // or such... need to say 'call the cleanup'.
        p.destroy();
    		break;
      case "later":
      	// save it for later?  should go to "later stuff" icon?
      	p.destroy();
      default:
      	break;
    }
  });

  that.openui.push(p);
  p.show(anchorit(),{persistent:true});
  return promise;

};