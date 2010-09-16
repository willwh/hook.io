require.paths.unshift(__dirname);

var sys = require('sys'), eyes = require('eyes');
var hookio = require('hookio');
var timers = exports.timers = {};
var resourcer = require('resourcer');

exports.start = function() {

  /* when starting the scheduler service, get all timer hooks and start them */
  
  /*
  hookio.Hooks.get({type: 'monitor'},function (e, obj) {
    eyes.inspect(e);
    eyes.inspect(obj);
  });
  */
  
  hookio.Hooks.get('monitor',function (e, obj) {
    eyes.inspect(e);
    eyes.inspect(obj);
    var task = new Task();

    obj.update({config:task},function (e, obj) {
       eyes.inspect(e);
       eyes.inspect(obj);
     });


  });


  /*
  hookio.Hooks.create({_id:"1", name:"poop"},  function (e, obj) {
    
    eyes.inspect(obj);
    
  });
  */
  
};



function Task(){
  
  this.startTime = new Date();
  this.endTime = new Date();
  this.count = 0;
  this.interval = 6000;
  
};