require.paths.unshift(__dirname);

var sys = require('sys'), eyes = require('eyes');
var hookio = require('hookio');
var timers = exports.timers = {};
var resourcer = require('resourcer');


/* 
    the scheduler can schedule Tasks 
*/

function Task(){
  
  this.startTime = new Date();
  this.endTime = new Date();
  this.count = 0;
  this.interval = 6000;
  
};

exports.start = function() {

  /* when starting the scheduler service, get all timer hooks and start them */
  
  /*
  hookio.Hooks.get({type: 'monitor'},function (e, obj) {
    eyes.inspect(e);
    eyes.inspect(obj);
  });
  */
  
  
  eyes.inspect(hookio.Hooks);
 
 
  hookio.Hooks.all(function (e, hooks) {
    
    hooks.forEach(function(item){
      if(item.type == 'monitor'){
        // start up all tasks
        
        // a count of 0 means run indefintely 
        if(item.config.count == 0){
          startTask(item.config)
        }
      }
    });
  });

  //var task = new Task();


  /*
  hookio.Hooks.create({_id:"1", name:"poop"},  function (e, obj) {
    
    eyes.inspect(obj);
    
  });
  */
  
};



var startTask = exports.startTask = function( task ) {
  eyes.inspect(task);
  try{
    setInterval(function(){
      sys.puts('hitting interval');
      
      
      // move this method into its own namespace
      hookio.services.shell.run('time');
      
    }, task.interval)
  }
  catch(err){
    eyes.inspect(err); 
  }
};


