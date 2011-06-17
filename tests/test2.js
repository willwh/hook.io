var Hook = require('hook.io').Hook;

var colors = require('colors');

var hook = new Hook({ name: 'simple-input-message-subscriber' });

hook.connect();


hook.on('i.test.o.test', function(source, event, data) {

  console.log('event, data');
  var expect = 'simple-message-to-output-test';
  
  if(data !== expect){
    console.log('fail'.red, expect, data);
  }
  else {
    console.log('pass'.green, expect);
  }

});
