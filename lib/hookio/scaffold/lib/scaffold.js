/*

   a hook.io hook generated with hookio init

*/


var Hook = require('hook.io').Hook,
    util = require('util');

var Scaffold = exports.Scaffold = function(options){
  Hook.call(this, options);
  var self = this;
};

// Scaffold inherits from Hook
util.inherits(Scaffold, Hook);

Scaffold.prototype.doSomething = function(options, callback){

};

Scaffold.prototype.doSomethingElse = function(options, callback){

};
