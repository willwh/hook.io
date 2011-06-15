var Hook = require('hook.io').Hook;

var hook = new Hook({ name: 'simple-input-message-subscriber' });

hook.connect();

hook.on('i.*', function(event, data){
  
  console.log(event, data);
  
});

