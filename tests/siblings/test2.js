// Tests the ability to start up a hook input listen for basic messages from siblings 
// this input will wait for messages from its siblings

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
      console.log('pass '.green, expect, ' from: ' + source + ' via: ' + event);
    }
  });
  
  console.log('pass '.green + 'simple-input-message-subscriber connected');
  
}
catch(err){
  console.log('fail '.red + err);
}
