var helpers = require('../helpers');


var expected_events = {
  "simple-output started" : {
    expected: 1
  },
  "simple-input-responder connected" : {
    expected: 1
  },
  "simple-input-responder-listen *.getSomething" : {
    expected: 1
  },
  "simple-input-caller connected" : {
    expected: 1
  },
  "simple-input-caller-listen *.gotResponse" : {
    expected: 1
  },
  "simple-input-caller-call *.getSomething" : {
    expected: 1
  },
  "simple-input-responder-receive simple-output.getSomething" : {
    expected: 1
  },
  "simple-input-caller-receive simple-output.gotResponse" : {
    expected: 1
  }
  
  
};


function fired( event, data ){
  expected_events = helpers.fired(event, expected_events, data);
};

// Test the ability to start up an output hook that other hooks can connect to
// this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
var Hook = require('hook.io').Hook;
var hook_simple_output = new Hook({ name: 'simple-output' });
var colors = require('colors');
hook_simple_output.listen({ port: 5001 });


hook_simple_output.on('listening', function(){

  fired('simple-output started');
  // Tests the ability to do a call and response to a sibling
  // this input will wait for a sibling to send it a message and then respond back

  var simple_input_callrsp = new Hook({ name: 'simple-input-responder' });
  simple_input_callrsp.connect({ port: 5001 });


  simple_input_callrsp.on('connected', function(){

    fired( 'simple-input-responder connected');

    simple_input_callrsp.on('*.getSomething', function(source, event, data) {

      //
      // perfom some logic here
      //
      fired( 'simple-input-responder-receive ' + source, data)
      simple_input_callrsp.emit('*.gotResponse', 'foobar');

    });
    
    fired( 'simple-input-responder-listen *.getSomething')

    // Tests the ability to do a call and response to a sibling
    // this input will wait for a sibling to send it a message and then respond back

    var simple_input_callrsp2 = new Hook({ name: 'simple-input-caller' });
    simple_input_callrsp2.connect({ port: 5001 });

    simple_input_callrsp2.on('*.gotResponse', function(source, event, data) {
      fired('simple-input-caller-receive ' + source, data);
    });
    fired( 'simple-input-caller-listen *.gotResponse')

    simple_input_callrsp2.on('connected', function(){

      fired('simple-input-caller connected');

      simple_input_callrsp2.emit('*.getSomething', 'i need a value please');
      fired('simple-input-caller-call *.getSomething', 'i need a value please');
    });

    // Perform a cleanup and calculate totals after a little while
    setTimeout(function(){

      helpers.report('test-sibling-callresponse.js', expected_events);

    }, 2000);

  });

});


