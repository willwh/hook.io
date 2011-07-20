var helpers = require('../helpers');


var expected_events = {
  "simple-server started" : {
    expected: 1
  },
  "simple-client-responder connected" : {
    expected: 1
  },
  "simple-client-responder-listen *.getSomething" : {
    expected: 1
  },
  "simple-client-caller connected" : {
    expected: 1
  },
  "simple-client-caller-listen *.gotResponse" : {
    expected: 1
  },
  "simple-client-caller-call *.getSomething" : {
    expected: 1
  },
  "simple-client-responder-receive simple-server.getSomething" : {
    expected: 1
  },
  "simple-client-caller-receive simple-server.gotResponse" : {
    expected: 1
  }
  
  
};


function fired( event, data ){
  expected_events = helpers.fired(event, expected_events, data);
};

// Test the ability to start up an output hook that other hooks can connect to
// this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
var Hook = require('../../lib/hookio').Hook;
var hook_simple_server = new Hook({ name: 'simple-server' });
var colors = require('colors');
hook_simple_server.listen({ port: 5001 });


hook_simple_server.on('listening', function(){

  fired('simple-server started');
  // Tests the ability to do a call and response to a sibling
  // this input will wait for a sibling to send it a message and then respond back

  var simple_client_callrsp = new Hook({ name: 'simple-client-responder' });
  simple_client_callrsp.connect({ port: 5001 });


  simple_client_callrsp.on('connected', function(){

    fired( 'simple-client-responder connected');

    simple_client_callrsp.on('*.getSomething', function(source, event, data) {

      //
      // perfom some logic here
      //
      fired( 'simple-client-responder-receive ' + source, data)
      simple_client_callrsp.emit('*.gotResponse', 'foobar');

    });
    
    fired( 'simple-client-responder-listen *.getSomething')

    // Tests the ability to do a call and response to a sibling
    // this input will wait for a sibling to send it a message and then respond back

    var simple_client_callrsp2 = new Hook({ name: 'simple-client-caller' });
    simple_client_callrsp2.connect({ port: 5001 });

    simple_client_callrsp2.on('*.gotResponse', function(source, event, data) {
      fired('simple-client-caller-receive ' + source, data);
    });
    fired( 'simple-client-caller-listen *.gotResponse')

    simple_client_callrsp2.on('connected', function(){

      fired('simple-client-caller connected');

      simple_client_callrsp2.emit('*.getSomething', 'i need a value please');
      fired('simple-client-caller-call *.getSomething', 'i need a value please');
    });

    // Perform a cleanup and calculate totals after a little while
    setTimeout(function(){

      helpers.report('test-sibling-callresponse.js', expected_events);

    }, 2000);

  });

});


