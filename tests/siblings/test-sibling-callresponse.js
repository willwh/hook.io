var helpers = require('../helpers');


var expected_events = {
  "basic-output started" : {
    count: 1
  },
  "simple-message-callresponse connected" : {
    count: 2
  },
  "simple-message-callresponse called" : {
    count: 1
  },
  "simple-message-callresponse got call" : {
    count: 1
  },
  "simple-message-callresponse responded i.gotResponse.o.gotResponse" : {
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
hook_basic_output.listen(5001);
fired('basic-output started');


// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

var simple_input_callrsp = new Hook({ name: 'simple-message-callresponse' });
simple_input_callrsp.connect(5001);

simple_input_callrsp.on('i.getSomething.o.getSomething', function(source, event, data) {

  //
  // perfom some logic here
  //
  fired( 'simple-message-callresponse got call')
  simple_input_callrsp.emit('o.gotResponse', 'foobar');
  
});
fired( 'simple-message-callresponse connected')



// Tests the ability to do a call and response to a sibling
// this input will wait for a sibling to send it a message and then respond back

var simple_input_callrsp2 = new Hook({ name: 'simple-message-callresponse' });
simple_input_callrsp2.connect(5001);
fired('simple-message-callresponse connected');


simple_input_callrsp2.on('i.gotResponse.o.gotResponse', function(source, event, data) {
  fired('simple-message-callresponse responded ' + source);
});

simple_input_callrsp2.on('ready', function(){
  simple_input_callrsp2.emit('o.getSomething', 'i need a value please');
  fired('simple-message-callresponse called');
});



// Perform a cleanup and calculate totals after a little while
setTimeout(function(){
  
  helpers.report('test-sibling-callresponse.js', expected_events);

}, 2000);

