require.paths.unshift(__dirname);

var sys = require('sys'), eyes = require('eyes');
var hookio = require('hookio');
var timers = exports.timers = {};
var resourcer = require('resourcer');

exports.start = function() {
  
  /* when starting the scheduler service, get all timer hooks and start them */
  
  
  
  
  eyes.inspect(hookio.Hook);
  
  
  hookio.Hooks.create({_id:"Hook", name:"poop"},  function (e, obj) {
    
    eyes.inspect(obj);
    /*

    hookio.Hooks.get({}, function (e, obj) {

      eyes.inspect(e, obj);

    });
    */
    
  });
  
  /*
  hookIO.db.getHooks({
    protocol: 'timer'
  }, function(hooks) {
    
    hooks.forEach(function(hook) {
      var duration = 1000 * parseInt(hook.get('interval'), 10);
      if (!hooks[duration] instanceof Array) {
        hooks[duration] = []
      }
      hooks[duration].push(hook);
    });

    var duration;
    for (duration in hooks) {
      timers[duration] = setTimeout(callback, duration, duration);
    }
  });
  */
  
};

exports.createTask = function() {
  
  return 'task';
};