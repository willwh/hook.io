/*
 * Creates a helloworld hook, then spawns three helloworld children
 */

var Hook = require('../../lib/hookio').Hook;

var pingPongModule = require('../../test/fixtures/pingPongModule.js');

var hook1 = new Hook({ 
  name: "server-hook",
});

var hook2 = new Hook({ 
  name: "callback-hook",
});


hook1.on('*::hello', function(data, callback){
  
  //
  // callback is the callback for this event,
  // should it exist
  //
  var result = {
    "text": "Why hello there!"
  };
  
  hook1.emit(this.event + '::out', result);

})

hook1.on('hook::ready', function(){
  
  hook2.start();
  
  hook2.on('hook::ready', function(){
    
    hook2.emit('hello');
    
    hook2.on('*::hello::out', function(data){
      console.log('hello::out ', data);
    });
    
    
  });
  
});

hook1.start();