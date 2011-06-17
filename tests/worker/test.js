// Test the ability to start up a hook with output will communicate with a worker 

try {
  var Hook = require('hook.io').Hook;
  var hook = new Hook({ name: 'basic-output' });
  var colors = require('colors');
  hook.listen();
  
  hook.on('i.test.o.test', function(event, data){
    console.log('pass '.green + 'got message back from simple-message-to-output');
  });
  
  console.log('pass '.green + 'basic-output server started');
}
catch(err) {
  console.log('fail '.red + err);
}
