// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

try {
  var Hook = require('hook.io').Hook;
  var colors = require('colors');

  var hook = new Hook({ name: 'simple-message-callresponse' });
  hook.connect();


  hook.on('i.gotResponse.o.gotResponse', function(source, event, data) {
    console.log('pass'.green + 'simple-message-callresponse responded ' + source);
  });

  console.log('pass '.green + 'simple-message-callresponse connected');

  hook.on('ready', function(){
    hook.emit('o.getSomething', 'i need a value please');
    console.log('pass '.green + 'simple-message-callresponse called');
  });

  
}
catch(err){
  console.log('fail '.red + err);
}
