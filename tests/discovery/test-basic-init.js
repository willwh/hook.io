var helpers = require('../helpers');

var expected_events = {
  "simple-listen listening" : {
    expected: 1
  },
  "simple-connect connected" : {
    expected: 1
  },
  "simple-start ready" : {
    expected: 1
  }
};


function fired( event, data ){
  expected_events = helpers.fired(event, expected_events, data);
};


//
// Create a new hook and then start up a server with hook.listen()
//
var Hook = require('../../lib/hookio').Hook;
var hook_simple_listen = new Hook({ name: 'simple-listen' });
hook_simple_listen.listen({ port: 5010 });


hook_simple_listen.on('listening', function(){

  fired('simple-listen listening');

  //
  // Create a new hook and then connect with hook.connect()
  //

  var hook_simple_connect = new Hook({ name: 'simple-connect' });
  
  hook_simple_connect.on('connected', function(){
    fired('simple-connect connected');

    var hook_simple_start = new Hook({ name: 'simple-start' });
    hook_simple_start.start({ port: 5010 });
    hook_simple_start.on('ready', function(){
      
      fired('simple-start ready');
      
    });
  });

  hook_simple_connect.connect({ port: 5010 });


});


// Perform a cleanup and calculate totals after a little while
setTimeout(function(){

  helpers.report('test-basic-init.js', expected_events);

}, 2000);