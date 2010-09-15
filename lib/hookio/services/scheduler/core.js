var timers = exports.timers = {};

exports.start = function() {
  
  /* when starting the scheduler service, get all timer hooks and start them */
  
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
};

exports.createTask = function() {
  
  return 'task';
};