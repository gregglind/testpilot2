"use strict";

const { Class, mix } = require('sdk/core/heritage');
const { Collection } = require("collection");
const data = require('self').data;
const { defer, promised, resolve } = require("sdk/core/promise");
const { emit, on, once, off } = require('sdk/event/core');
const { EventTarget } = require('sdk/event/target');
const observer = require("observer-service");
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;
const timers = require("timers");
let {has} = require('array');

const {extensiontracker} = require("extensiontracker");
const {ohno, tplog, urlize_addon_path} = require("tputils");


const {actions} = require("flight-actions");

/*
let Study = exports.Study = Class({
  initialize: function initialize(config) {
    // default experiment type
    if (config.studytype === undefined) {config.studytype = 'experiment'}
    if (config.duration === undefined) config.duration =  DEFAULT_DURATION;

    // now validate
    var vconfig = validateOptionsLiberal(config, StudyOptionsRequirements);
    this.config = vconfig;
    this.activetimers = new Collection();
    this.activeui = new Collection();
    this.activedownloads = new Collection();
    this.activeobservers = new Collection();
    this.activepagemods = new Collection();
  },
  extends:  EventTarget,
  type: 'Study',

  get studytype(){ return this.config.studytype },

  persist: function() {
    let config = this.config;
    var id = config.id;
    myprefs['config.' + id] = JSON.stringify(config); // let this throw if it does
  },

  get observing() {
    let topics = [x['topic'] for (x in this.activeobservers)]
    return topics.sort();
  },

  get status() { return this.config.status },
  set status(status) {
    if (status === undefined) {
        return this.config.status;
    } else {
        return this.setStatus(status);
    }
  },

  /* Notes on status:
   * 1.  we 'set' early, then do stuff as though that status is now true.
   * 2.  resetting to the same status will kill and re-trigger ui.
   * 3.  use (if (s.status != mystatus), s.status = newstatus) idiom if you
   *     are concerned about this.
   *
  setStatus: function(status){
    let S = STATUS;
    let my = this.config;
    //console.log("STATUS:", this.config.id, this.config.status, '->', status);
    emit(this,'setstatus',{"from":this.config.status,"to":status});
    this.statuscleanup();
    this.config.status = status;  // set 'before success'

    tpnotify({'when':Date.now(), 'message':'setstatus','id':my.id,'from':my.status,'to':status});
    this.persist();  // always persist, in case we die RIGHT NOW.
    switch (status) {
      case S.NEW:
        this.uninstall();
        this.setStatus(S.ASKINSTALL);
        break;
      case S.ASKINSTALL:  this.askinstall(); break;
      case S.INSTALL:  this.install(); break;
      case S.COLLECTING:  this.collect(); break;
      case S.ASKUPLOAD: this.askupload(); break;
      case S.UPLOAD:  this.upload(); break;
      case S.COMPLETE:  this.uninstall(); break;
      case S.ERROR:   this.uninstall(); break;
      case S.REFUSED: this.uninstall(); break;
      case S.IGNORED:  this.uninstall(); break;
      case S.ABANDONED:  this.uninstall(); break;
      default:
        console.error("ERROR:  what is this status?", status);
    };
    return status
  },

  // TODO, figure out which of these need to run when.
  statuscleanup:  function(){
    console.log("calling statuscleanup on:", this.config.id);
    this.clearui();
    this.cleartimers();
    this.clearpagemods();
    //this.clearobservers();  // for some statuses, these should persist.
  },

  clearobservers: function(){
    for (let x in this.activeobservers) {
        if (x.topic === undefined || x.obs === undefined) {
            continue
        }
        console.log('killing observer',x.topic,Object.keys(x));
        observer.remove(x.topic,x.obs);
    };
    this.activeobservers = new Collection(); // reset
    return true;
  },

  askinstall: function(){
    console.log("askInstall");
    let my = this.config;
    if (my.askinstall === undefined) my.askinstall = {};
    let attempts = Number(my.askinstall.asks || 0);
    let nextattempt = Number(my.askinstall.nextask || 0);
    console.log('asking to run:', my.id,  'attempt:', attempts);

    let listeners = [];
    listeners.push( this.once("status", function(message){
        console.log("FROM TPBOX", message);
        if (message == "ACCEPTED") {
            this.setStatus(STATUS.INSTALL);
        };
    }));

    if (my.studytype == "simplesurvey") {
        var askbanner = ask_survey(this); // setStatus inside there.
        this.activeui.add(askbanner);
    } else {
        var askbanner = ask_experiment_install(this); // this is tangled
        this.activeui.add(askbanner);
    }
  },

  install:  function(){
    console.log("installing");
    // Ready to rock! installed everything here!
    this.once("installed",function() {
        console.log("installed");
        this.setStatus(STATUS.COLLECTING);
    });
    this.start_experiment();  //my.duration, addons, etc.
  },

  collect:  function(){
    let study = this;
    let my = this.config;
    console.log("collecting");

    this.once("donecollecting",function() {
        this.clearobservers();
        this.clearpagemods();  // kill the pagemods.
        this.setStatus(STATUS.ASKUPLOAD);
    });

    let duration =  (Number(my.duration) || DEFAULT_DURATION);
    my.donetime= 1000 * duration + Date.now();
    console.log(duration, "killing at", my.donetime, Date.now() );
    var donetimer = timers.setInterval(function(){
        if (Date.now() > my.donetime) {
            console.log(Date.now());
            emit(study,'donecollecting');
            timers.clearInterval(donetimer); // cleanup
        }
    }, my.donetime-Date.now());
    this.activetimers.add(donetimer);
  },

  askupload: function(){
    console.log("askupload");
    let listeners = [];
    listeners.push( this.once("status", function(message){
        console.log("FROM TPBOX", message);
        if (message == "ACCEPTED") {
            this.setStatus(STATUS.UPLOAD);
        };
    }));

    // handle "always upload"
    if (myprefs['uploadwithoutprompting']){
        console.log("uploadwithoutprompting");
        emit(this,"status", {message: "ACCEPTED"})
    } else {
        var askbanner = ask_experiment_upload(this); // this signals status back
        this.activeui.add(askbanner);
    }
  },


  uninstall:  function uninstall(success){
    let my = this.config;
    this.statuscleanup();
    let id = my.id;

    console.log("we have extensions");
    for (let extid in extensiontracker.addonsforstudy(id)) {
        console.log("removing addon", extid, id);
        tpbanner({msg:"disabling:" + extid});
        extensiontracker.uninstall(extid,id);
    };
    // uninstall observers, should any remain.
    this.clearobservers();
  },

  clearui: function(){
    console.log('softkilling any banners');
    console.log('softkilling any panels');
    for (let x in this.activeui) {
        console.log('  (killing)',x);
        emit(x,"softkill"); // tpbanner hears this.
    };
    this.activeui = new Collection();
  },

  cleartimers: function(){
    console.log('clearing timers');
    for (let x in this.activetimers) {
      // clear both, just in case!
      timers.clearTimeout(x);
      timers.clearInterval(x);
    };
    this.activetimers = new Collection();
  },

  clearpagemods: function(){  // assumption: deleted pagemods don't leak
    delete this.activepagemods;
    this.activepagemods = new Collection();
  },

  start_experiment: function() {
    /*  UI and monitoring experiments.

    install plugins.
    change binary. // TODO
    install listeners.
    pagemods (for simple experiments)
    add duration / timeout.
    set status to running.
    *

    // TODO, handle errors with failure here.


    let my = this.config;
    let id = my.id;

    // add the observer for eventselectors, just in case
    let eventselectors_obs_chan = "testpilot-"+ my.id ;
    if (my.observe === undefined) {
        console.log("my.observe undefined");
        my.observe = []
    };

    if (my.observe.indexOf(eventselectors_obs_chan) == -1) {
        my.observe.push(eventselectors_obs_chan);
    }

    // set observer listeners first.
    let obscoll = this.activeobservers;
    console.log("will want to observe:", my['observe']);
    my['observe'].forEach(
        function (topic) {
            console.log("tp adding observer for:", topic,id);
            let cb = function(subject) {record.watch(subject,id)}; // actually recording.
            let o = observer.add(topic,cb);
            obscoll.add({topic:topic,obs:cb});
            console.log("result of add:", o,cb)
            // TODO fix the observer-server.js, which lies here!
            //    add returns *nothing*
    });

    // install any addons, tracking them?
    var addons = my['addons'] || [];
    addons.forEach(function(obj) {
        let {url} = obj;
        console.log("start exp:  ", url);
        extensiontracker.install(urlize_addon_path(url),my.id)
    });

    console.log('starting pagemod, if needed.');
    if (my.eventselectors) {
        console.log(JSON.stringify(my.eventselectors));
        //this.pagemods = [ EventSelector(x,eventselectors_obs_chan) for each (x in my.eventselectors) ];
        my.eventselectors.forEach(function(x){this.activepagemods.push(
            EventSelector(x,eventselectors_obs_chan))});

    }
    my.donetime= 1000 * (Number(my.duration) || DEFAULT_DURATION) + Date.now();
    emit(this,"installed");
  },

}); // end of Study class
*/



/*
  flights need to know:
  * spec
  * results of each step
  * status
  * result / progress of cleanup (to keep retrying)
  * ??

  STATUS is:

  * running
  * complete
  * cleaning
  * stopped

*/
let Flight = exports.Flight = Class({
    initialize: function(d){
        // see if I already have one with that name.
        // if so, go to heck, unless kill
        // validate the config?
        this.meta = d;
        this.spec = d.spec;
    },
    attempt: function(flightplan){
      flightplan = flightplan || this.spec.flightplan || [];
      tplog("Flight:attemping", this.spec.name)

      let that = this;
      let promise = resolve(1);
      flightplan.forEach(function(act,ii){
          tplog("setting act",ii)
          // if not already done
          // do all subparts
          // promise = promise.then(function() that.doAct(act,ii,that));
          promise = promise.then(function() that.doAct(act,ii,that));
      })

      promise = promise.then(function() {
        tplog("Flight:", that.spec.name,"all steps completed");
        that.status = 'complete'
      }, ohno)
      return promise;
    },
    doActList: function(actionList){
        promised(Array)()
    },
    doAct: function(act,ii,that){
      tplog("doing act",ii, Date.now())
      let results = that.meta.results;
      let {promise,resolve,reject} = defer();
      if (results.run[ii] !== undefined){
        tplog("step", ii, "already done!  at ", results.run[ii]);
        resolve();
      } else {
        tplog("doAct",act.action)
        actions[act.action](act,that).then(function(){
          results.run[ii] = Date.now();
          resolve()
        })
      }
      return promise
    },
    stopflight: function(){
        // for each step, undo.
        this.meta.status = 'stopped'
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
