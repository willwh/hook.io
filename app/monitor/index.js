// simple monitoring application 

var sys    = require('sys'), 
    eyes   = require('eyes'),
    hookio = require('../../lib/hookio');

// Remark: we are going to hardcode a hook here to demonstrate when a hook might look like
function Hook( name ) {
  
  this.id = new Date().getTime(); // replace this with unique ID from DB
  
  this.start = function( options ){
    
    
    
  }
  
  this.callback = function( result ){
    
  };

  
  
}



var monitor = new Hook('monitor');

monitor.callback = function(){
  
};

//eyes.inspect(monitor);