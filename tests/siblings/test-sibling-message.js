  var helpers = require('../helpers');

  var expected_events = {
    "simple-output started" : {
      expected: 1
    },
    "simple-input connected" : {
      expected: 1
    },
    "simple-input-handler-listen i.test.o.test" : {
      expected: 1
    },
    "simple-input-caller connected" : {
      expected: 1
    },
    "simple-input-caller-call o.test" : {
      expected: 1
    },
    "simple-input-handler-receive i.test" : {
      expected: 1
    }
  };

  function fired( event , data ){
    expected_events = helpers.fired(event, expected_events, data);
  };

  // Test the ability to start up an output hook that other hooks can connect to
  // this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
  var Hook = require('hook.io').Hook;
  var hook_simple_output = new Hook({ name: 'simple-output' });
  var colors = require('colors');
  hook_simple_output.listen();

  hook_simple_output.on('listening', function(){
    
    fired('simple-output started');

    // Tests the ability to start up a hook input listen for simple messages from siblings 
    // this input will wait for messages from its siblings
    var hook_simple_message_subscriber = new Hook({ name: 'simple-input-handler' });
    hook_simple_message_subscriber.connect();

    hook_simple_message_subscriber.on('connected', function(){

      fired('simple-input connected');
      
      hook_simple_message_subscriber.on('i.test', function(source, event, data) {
        var expect = 'hello there!';

        if(data !== expect){
          //h(false, expect, data);
        }
        else {
          fired('simple-input-handler-receive ' + source, data);
        }

      });
      fired('simple-input-handler-listen i.test.o.test');

      // Tests the ability to start up a hook input and broadcast a simple message to it's siblings 
      // this input will broadcast a message on ready
      var hook_simple_message = new Hook({ name: 'simple-input-caller' });
      hook_simple_message.connect();

      hook_simple_message.on('connected', function(){
        fired('simple-input-caller connected');
        hook_simple_message.emit('o.test', 'hello there!');
        fired('simple-input-caller-call o.test', 'hello there!')
      });

      // Perform a cleanup and calculate totals after a little while
      setTimeout(function(){

        helpers.report('test-sibling-message.js', expected_events);

      }, 2000);
      
      
    });


  });



  