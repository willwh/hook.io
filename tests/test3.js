
var Hook = require('hook.io').Hook;

var hook = new Hook({ name: 'simple-message-to-output' });

hook.start();

hook.on('ready', function(){

  hook.emit('o.test', 'simple-message-to-output-test');
  
});

