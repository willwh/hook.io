// Test the ability to start up a hook with output that other hooks can connect to and that 
// receive and rebroadcast messages

try {
  var Hook = require('hook.io').Hook;
  var hook = new Hook({ name: 'basic-output' });
  var colors = require('colors');
  hook.listen();
  console.log('pass '.green + 'basic-output server started');
}
catch(err) {
  console.log('fail '.red + err);
}
