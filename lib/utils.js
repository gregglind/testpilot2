// utilities?

var codeok = function(s, codes) {
    if (codes === undefined) { codes = [0,200,201,202]; };
    return codes.some(function(e) { return (e == s) } );
};


var In = function(thing,array) { return array.indexOf(thing) >= 0 };


// TODO, yuck.  uses pref, mangles paths, fragile.
var urlize_addon_path = function(fileid) {
    /* this is toally weak-tea and unreliable...! ":" in string! */
    if (/:/.test(fileid)) { return fileid }
    if (/^\+/.test(fileid)) {return data.url(fileid.substring(1))}
    else {return myprefs['indexurl'] + "/../" + fileid}
};