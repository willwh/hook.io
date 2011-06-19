  var helpers = require('../helpers');

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


  function fired( event ){
    expected_events = helpers.fired(event, expected_events);
  };


  // Test the ability to start up an output hook that other hooks can connect to
  // this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
  var Hook = require('hook.io').Hook;
  var hook_basic_output = new Hook({ name: 'basic-output' });
  var colors = require('colors');
  hook_basic_output.listen();
  fired('basic-output server started');

  // Tests the ability to start up a hook input listen for basic messages from siblings 
  // this input will wait for messages from its siblings
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
  
  
  
  // Tests the ability to start up a hook input and broadcast a basic message to it's siblings 
  // this input will broadcast a message on ready
  var hook_basic_message = new Hook({ name: 'simple-message-to-output' });
  hook_basic_message.start();
  hook_basic_message.on('ready', function(){
    hook_basic_message.emit('o.test', 'simple-message-to-output-test');
    fired('simple-message-to-output sent')
  });

  // Perform a cleanup and calculate totals after a little while
  setTimeout(function(){
    
    helpers.report('test-sibling-message.js', expected_events);

  }, 2000);
  
  