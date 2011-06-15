var Hook = require('hook.io').Hook;

var hook = new Hook({ name: 'simple-input-message-publish' });

hook.connect();

hook.on('ready', function(){

  hook.emit('o.test', 'simple-message-to-output-test');
  
});

