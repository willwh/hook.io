// Test the ability to retrieve configuration data in current hook cloud

try {
  var Hook = require('hook.io').Hook;
  var hook = new Hook({ name: 'basic-nconf-test' });
  var colors = require('colors');
  hook.connect();
  console.log('pass '.green + 'basic-nconf-test connected');

  hook.on('ready', function(){

    var data = hook.get('test');
    if(data.foo == "hello config"){
      console.log('pass '.green + 'basic-nconf-test get()');
    }
    
  });
  
  
}
catch(err) {
  console.log('fail '.red + err);
}
