// tests the ability to send a basic message to a hook output
// with a duplicate hook name

try {
  
  var Hook = require('hook.io').Hook;
  var colors = require('colors');
  
  var hook = new Hook({ name: 'simple-message-to-output' });

  hook.start();

  hook.on('ready', function(){
    hook.emit('o.test', 'simple-message-to-output-test');
    console.log('pass '.green + 'simple-message-to-output sent');
  });
  
}
catch(err){
  console.log('fail '.red + err);
}
