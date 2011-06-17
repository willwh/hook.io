// Test the ability to start up an output hook that sets some config.json data

try {
  var Hook = require('hook.io').Hook;
  var hook = new Hook({ name: 'basic-nconf-test' });
  var colors = require('colors');
  hook.listen();
  console.log('pass '.green + 'basic-nconf-test started');
  
  hook.set('test:foo', 'hello config')
  console.log('pass '.green + 'basic-nconf-test set()');
  
  hook.save();
  console.log('pass '.green + 'basic-nconf-test save()');
  
  
}
catch(err) {
  console.log('fail '.red + err);
}
