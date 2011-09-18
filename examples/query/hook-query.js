/*
 * Creates a helloworld hook, then spawns three helloworld children
 */

var Hook = require('../../lib/hookio').Hook;

var pingPongModule = require('../../test/fixtures/pingPongModule.js');

var hook1 = new Hook({ 
  name: "server-hook"
});

hook1.on('hook::ready', function(){

  hook1.on('children::ready', function(){
    
    
    /*
    hook1.query({ "type":"hook" }, function(err, result){
      
      console.log(err, result);
      
    });
    */
    
    //
    // Remark: Get all hooks of generic type "hook" with a callback
    //
    hook1.emit('query', { "type": "hook" }, function(err, result){
      console.log('hook query result:'.green.bold.underline + ' ' + JSON.stringify(result, true, 2).grey);
    });

    //
    // Remark: Get all hooks of generic type "hook" with an emitter
    //
    hook1.on('query::out', function(result){
      console.log('hook query result:'.green.bold.underline + ' ' + JSON.stringify(result, true, 2).grey);
    });

    hook1.emit('query', { "type":"hook" });

  });

  hook1.spawn([
     {
       type: 'hook',
       name: 'b',
       foo: "bar"
     },
     {
       type: 'hook',
       name: 'c',
       beep: "boop"
     },
     {
       type: 'hook',
       name: 'd'
     }
   ]);
  
});

hook1.start();