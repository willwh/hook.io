// Test the ability to start up an output hook that other hooks can connect to
// this output will receive and rebroadcast messages to all its children ( which are siblings to each other )

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
