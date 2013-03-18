Test Pilot 2:  A System For Deploying Features
==================================================

## Test Pilot

* deploy features to (subsets of) Firefox users
* monitor feature usage

Test Pilot 2 is:

* **control tower** : central Flight (study) deployment
* **flights** : config for individual studies
* **flightplan** : declarative spec for what happens during a flight
* **copilot** : a 'sensible-default' study type for handling simple studies
* **flightlog** : facilities for recording progress of flights, and 'do this later'

## Test Pilot:  Control Tower

* approves and runs **FLIGHTS**
* central url for knowing what FLIGHTS to run
* keeper of status and progress of all flights


### Guiding principles

* just a config loader / manager
* all 'interactions' should be 'later-able' / recall-able / cancellable
* central list of known studies
* studies (mostly) take care of themselves (recording, uploading, etc.)
* FLIGHT config handles "worst-case" clean-up and undo of misbehaving studies.

### Core code:

```
downloadFlightConfigs(url        // central/control/index.json
).then(
	parseConfig           // json
).then(
	setupFlights  //  for each, create flightplan, update only on kill
).then(
	attemptFlights
).error(
	ohno                   // errors
)

```

## Test Pilot:  Flights

### Flight:

1.  a JSON declarative description of a study / experiment / feature deploy
2.  a (realized) attempt to run a study/experiment/flightplan

### Example Flight Specification

```
{  studyname:  feature-studyversion-(os-locale)-version,
   author:
   description:
   flightplan:  [see below],
   endBy:  ts   // another kill switch.  if not completed within this time frame, 'kill'
   kill: bool   // if true, end/trash any existing studies, removing any addon, flight status to 'killed'
   infourl:   // link to describe the study, risks, etc.?
   version: 1  // of the recipe spec?  of the study?
   filter:      // run iff match
   	- channels
   	- oses
   	- locales
   	- (etc?)
   randomDeploy:   // after filter!
    - keyname:
    - ge:   [0,1)
    - lt:   (0,1]
}
```

### Flight `variables`

These are available many places where strings are useful (templates, urls, observer, notify, etc)


Flight:  (a running study)

* starttime
* flightplan
* flight status (if set)
* (flightplan progress / status)

  - current (sub)step info

* peopleconfig (personid, studyid, os, channel, etc.)

### Flight Methods

* `kill()`   # undoes things, unregisteres, set status to 'killed'
* `__fuse` that times out after duration


## Test Pilot:  Flight Plans

Flight Plans are a declarative JSON data structure for describing what should happen during a FLIGHT.

### Principles

1. sequential.  Next line only happens if current line resolves true.
2. If directive is object, run it.  if `list`, parallel run all.  (`promised(Array)`)
3. No 'side effects', except through `addon`.  (Implicaton, if you want 'recur', you need to do it in addon)
4. EVERYTHING NEEDS TO CLEAN UP.  as part of 'action', implies an 'unaction'.
5.  Declarative actions make it easy to save, serialize, restart.


## Plain English Example

* wait until friday
* ping home
* ask a (pre) survey
* install some addons
* hang out a week, while addons do their thing
* ask (post) survey

### Flight Plan JSON

```
// something like

[
	{action: 'wait',  until:  ts_or_datestring},   //  JSON dates are junk.
	{action: 'ping', url: 'someurl/for/base/{{os}}',  }, // will just do
	{action: 'external', title:'',text:'', type: 'survey',waitFor: 'ok'}, // might get fancier
	[{action: 'addon', url: url, permission: 'warn', msg: ''},  {action: 'addon', url: url, permission: 'notify'}], // multiple directives, waits until all installed.  Notifies of installs?
	[  {action: 'observe', topic: "some topic"},
	   {action: 'observe', subject: 'other subject'}, // should we allow 'subject only?'
	   {action: 'observe', topic: "third topic", subject: 'combo subject'}
	],
	{action: external, url: 'some/post/survey'}
]
```

### Flight Plan Actions / Directives:

**wait**:			// simple Fuse / timeout stuff
	- until:  dateish
	- for:    ts,ms?

**ping**:
	- url_template  // moustache style?
	- method:  GET | POST | PUT?
    - data???  // maybe not!

**ui/external**:
 	- url_template:
 	- type:  survey / message ?  // determines template and icons, etc.

**addon**:
    - do:  "ensure|"
    - id:
	- url, or path  ?
	- install, uninstall, ensure?  // puppet packages style?
	- warn?  // ie some config about whether to notify people?

**micropilot/copilot/instrument**:  (instrument options)

**observe**:
	- topic OR topic, subject

**notify**:
	- topic, subject, data (once)

**log / status / message** :   modify the Flight ??



## Test Pilot:  Co-pilot

(in developement)

* Basic, simple declarative config for running 'usual' studies.
* Allows instrumenting of non-jetpack addons
* rebranding of / derived from [gregglind/micropilot-template](http://github.com/gregglind/micropilot-template)
* wraps [gregglind/micropilot](http://github.com/gregglind/micropilot)


```
# sneak preview
brew install npm;  # apt-get install npm
npm install -g volo
volo create myaddon gregglind/micropilot-template
```

## Test Pilot:  Flight Log

(TBD, decide UI, build)

* debugging for developers;  transparency for users.
* on 'do later' in dialogues, save action in a central messaging center
* view 'progress' of `flights`.
* kill / cancel flights


## Future directions

* improve and codify the 'copilot' system.
* "arms" of studies.  Should these be simpler?


## Other general stuff

`ts_or_datestring` :

- it's going in to `Date()`, for good or ill!
- if string, better be:  "2012-04-23T18:25:43.511Z" or such :)

`url` :

- usually can handle moustache-style vars `{{os}}`


## How do I do?

TBD


## Credits

Author:  Gregg Lind


