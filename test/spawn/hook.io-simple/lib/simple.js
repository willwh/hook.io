/*
 * Simple Hook-io plugin
 */

var Hook = require('hook.io').Hook,
    util = require('util');

var Simple = exports.Simple = function (options) {
  var self = this;
  Hook.call(this, options);

  this.on('simple.*', function(event, data){
   console.log('something on: '.green + event.toString().yellow + ' ' + JSON.stringify(data).grey);
  });

  this.on('ready', function(){
    // This is just to simulate I/O, don't use timers...
    setInterval(function(){
      self.emit('simple.hello', 'Hello, I am ' + self.name);
    }, 5000);
  });

};

util.inherits(Simple, Hook);
