/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/*
    let pagedata = {
        title: "My title",
        icon: self.data.url("img/testPilot_200x200.png"),
        content: ["Para1 is a good para", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."],
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
    const pageMod = require("sdk/page-mod")
    pageMod.PageMod({
      include: self.data.url("notification.html"),
      contentScriptOptions:  {pagedata: pagedata},
      contentScriptFile: [self.data.url("js/jquery.min.js"),
                        self.data.url("js/underscore-min.js"),
                        self.data.url("js/notification.js")],
      contentScriptWhen: 'ready',
      onAttach: function(worker) {
        worker.port.emit("customize");
      }
    });
    tabs.open(self.data.url("notification.html"))
*/