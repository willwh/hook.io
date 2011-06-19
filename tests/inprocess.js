// Test the ability to start up an output hook that other hooks can connect to
// this output will receive and rebroadcast messages to all its children ( which are siblings to each other )


  var expected_events = {
    "basic-output server started" : {
      count: 1
    },
    "simple-message-to-output-test" : {
      count: 1
    },
    "simple-input-message-subscriber connected" : {
      count: 1
    },
    "simple-message-to-output sent" : {
      count: 1
    }
  };


  function fired(event) {
    try{
      expected_events[event].count--
      
    }catch(err){
      console.log('unexpected event fired: ' + event);
    }
  };


  var Hook = require('hook.io').Hook;

  var hook_basic_output = new Hook({ name: 'basic-output' });
  var colors = require('colors');
  hook_basic_output.listen();
  fired('basic-output server started');


  var hook_basic_message_subscriber = new Hook({ name: 'simple-input-message-subscriber' });
  hook_basic_message_subscriber.connect();
  hook_basic_message_subscriber.on('i.test.o.test', function(source, event, data) {
    var expect = 'simple-message-to-output-test';

    if(data !== expect){
      //h(false, expect, data);
    }
    else {
      fired(expect, source, event);
    }
    
  });
  fired('simple-input-message-subscriber connected');
  
  var hook_basic_message = new Hook({ name: 'simple-message-to-output' });
  hook_basic_message.start();
  hook_basic_message.on('ready', function(){
    hook_basic_message.emit('o.test', 'simple-message-to-output-test');
    fired('simple-message-to-output sent')
  });
  
  
  
  setTimeout(function(){
    
    console.log('tests have completed, here is the report:' );
    for (var e in expected_events) {
      console.log( expected_events[e].count.toString().yellow + ' ' + e.green );
    }

  }, 2000);
  
  