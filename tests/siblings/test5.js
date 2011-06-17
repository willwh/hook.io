// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

try {
  var Hook = require('hook.io').Hook;
  var colors = require('colors');

  var hook = new Hook({ name: 'simple-message-callresponse' });
  hook.connect();

  hook.on('i.getSomething.o.getSomething', function(source, event, data) {

    // perfom some logic here
    console.log('pass '.green + 'simple-message-callresponse got call');
    hook.emit('o.gotResponse', 'foobar');
    
  });
  console.log('pass '.green + 'simple-message-callresponse connected');
  
}
catch(err){
  console.log('fail '.red + err);
}
