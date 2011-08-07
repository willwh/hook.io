/*
 * Creates a helloworld hook, then 
 */

var Helloworld = require('hook.io-helloworld').Helloworld;

var myHello = new Helloworld({ name: "helloworld" });

myHello.on('hook::ready', function(){

   // 
   // This will spawn up two more "helloworld" hooks with auto-configuration
   // see: custom-hook-spawn.js for customized spawn settings
   // 
   //
   myHello.spawn('helloworld');

});

myHello.start();