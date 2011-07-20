  var helpers = require('../helpers');

  var expected_events = {
    "simple-server started" : {
      expected: 1
    },
    "simple-client connected" : {
      expected: 1
    },
    "simple-client-handler-listen *.test" : {
      expected: 1
    },
    "simple-client-caller connected" : {
      expected: 1
    },
    "simple-client-caller-call test" : {
      expected: 1
    },
    "simple-client-handler-receive simple-server.test" : {
      expected: 1
    }
  };

  function fired( event , data ){
    expected_events = helpers.fired(event, expected_events, data);
  };

  // Test the ability to start up an output hook that other hooks can connect to
  // this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
  var Hook = require('../../lib/hookio').Hook;
  var hook_simple_server = new Hook({ name: 'simple-server' });
  var colors = require('colors');
  hook_simple_server.listen();

  hook_simple_server.on('listening', function(){
    
    fired('simple-server started');

    // Tests the ability to start up a hook input listen for simple messages from siblings 
    // this input will wait for messages from its siblings
    var hook_simple_message_subscriber = new Hook({ name: 'simple-client-handler' });
    hook_simple_message_subscriber.connect();

    hook_simple_message_subscriber.on('connected', function(){

      fired('simple-client connected');
      
      hook_simple_message_subscriber.on('*.test', function(source, event, data) {
        var expect = 'hello there!';

        if(data !== expect){
          //h(false, expect, data);
        }
        else {
          fired('simple-client-handler-receive ' + source, data);
        }

      });
      fired('simple-client-handler-listen *.test');

      // Tests the ability to start up a hook input and broadcast a simple message to it's siblings 
      // this input will broadcast a message on ready
      var hook_simple_message = new Hook({ name: 'simple-client-caller' });
      hook_simple_message.connect();

      hook_simple_message.on('connected', function(){
        fired('simple-client-caller connected');
        hook_simple_message.emit('*.test', 'hello there!');
        fired('simple-client-caller-call test', 'hello there!')
      });

      // Perform a cleanup and calculate totals after a little while
      setTimeout(function(){

        helpers.report('test-sibling-message.js', expected_events);

      }, 2000);
      
      
    });


  });



  