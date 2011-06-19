var helpers = require('../helpers');


var expected_events = {
  "simple-output started" : {
    expected: 1
  },
  "simple-input-responder connected" : {
    expected: 1
  },
  "simple-input-responder-listen i.getSomething" : {
    expected: 1
  },
  "simple-input-caller connected" : {
    expected: 1
  },
  "simple-input-caller-listen i.gotResponse" : {
    expected: 1
  },
  "simple-input-caller-call o.getSomething" : {
    expected: 1
  },
  "simple-input-responder-receive i.getSomething.o.getSomething" : {
    expected: 1
  },
  "simple-input-caller-receive i.gotResponse.o.gotResponse" : {
    expected: 1
  }
  
  
};


function fired( event ){
  expected_events = helpers.fired(event, expected_events);
};




// Test the ability to start up an output hook that other hooks can connect to
// this output will receive and rebroadcast messages to all its children ( which are siblings to each other )
var Hook = require('hook.io').Hook;
var hook_simple_output = new Hook({ name: 'simple-output' });
var colors = require('colors');
hook_simple_output.listen(5001);
fired('simple-output started');


// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

var simple_input_callrsp = new Hook({ name: 'simple-input-responder' });
simple_input_callrsp.connect(5001);
fired( 'simple-input-responder connected')

simple_input_callrsp.on('i.getSomething.o.getSomething', function(source, event, data) {

  //
  // perfom some logic here
  //
  fired( 'simple-input-responder-receive ' + source)
  simple_input_callrsp.emit('o.gotResponse', 'foobar');
  
});
fired( 'simple-input-responder-listen i.getSomething')



// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

var simple_input_callrsp2 = new Hook({ name: 'simple-input-caller' });
simple_input_callrsp2.connect(5001);
fired('simple-input-caller connected');


simple_input_callrsp2.on('i.gotResponse.o.gotResponse', function(source, event, data) {
  fired('simple-input-caller-receive ' + source);
});
fired( 'simple-input-caller-listen i.gotResponse')


simple_input_callrsp2.on('ready', function(){
  simple_input_callrsp2.emit('o.getSomething', 'i need a value please');
  fired('simple-input-caller-call o.getSomething');
});



// Perform a cleanup and calculate totals after a little while
setTimeout(function(){
  
  helpers.report('test-sibling-callresponse.js', expected_events);

}, 2000);

