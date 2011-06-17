// Test the ability to start up a hook with output that can get a message

var Hook = require('hook.io').Hook;

var hook = new Hook({ name: 'basic-output' });

hook.listen();


console.log('basic-output');