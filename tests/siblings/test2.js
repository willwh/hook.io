// tests the ability listen for basic messages from a hook output (server)

try {
  var Hook = require('hook.io').Hook;
  var colors = require('colors');

  var hook = new Hook({ name: 'simple-input-message-subscriber' });
  hook.connect();

  hook.on('i.test.o.test', function(source, event, data) {
    console.log('event, data');
    var expect = 'simple-message-to-output-test';

    if(data !== expect){
      console.log('fail '.red, expect, data);
    }
    else {
      console.log('pass '.green, expect);
    }
  });
  
  console.log('pass '.green + 'simple-input-message-subscriber connected');
  
}
catch(err){
  console.log('fail '.red + err);
}
