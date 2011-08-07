/*
 * Custom Hook-io Spawn
 */

var Hook = require('../lib/hookio').Hook,
    util = require('util');


var Helloworld = exports.Helloworld = function (options) {

  var self = this;
  Hook.call(this, options);
  
  this.on('hook::ready', function () {
    //
    // This is just to simulate I/O, don't use timers...
    //
    setInterval(function () {
      self.emit('hello', 'Hello, I am ' + self.name);
    }, 1000);
  });
};

//
// Inherit from `hookio.Hook`
//
util.inherits(Helloworld, Hook);



var myHello = new Helloworld({name:"a"});

myHello.on('hook::ready', function(){
  
  myHello.spawn([
     {
       type: 'helloworld',
       name: 'b'
     },
     {
       type: 'helloworld',
       name: 'c'
     },
     {
       type: 'helloworld',
       name: 'd'
     }
   ]);

     
});

myHello.start();