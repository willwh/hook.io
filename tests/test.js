// Test the ability to start up a hook with output that can get a message

var Hook = require('hook.io').Hook;

var hook = new Hook({ name: 'basic-output' });

hook.listen();

hook.on('i.test', function(event, data) {

  var expect = 'simple-message-to-output-test';
  
  if(data !== expect){
    console.log('fail', expect, data);
  }
  else {
    console.log('pass', expect);
  }

  hook.emit('o.test', 'simple-message-to-output-test');

});


console.log('basic-output');