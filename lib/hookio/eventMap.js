module['exports'] = function (options) {
  
  var self = this;
  
  //
  // If we have been passed in an eventMap,
  // map each event to the Hook
  //
  if (typeof options.eventMap === 'object') {
    self.mapEvents(options.eventMap);
  }
  
  this.on('*::getEvents', function (cb) {
    cb(null, self.getEvents());
  });

  self.on("*::query", self.query);
  self.on("query", self.query);

  //
  // Remark: Listen for error events, or else they will get squashed
  //
  //this.on('*::error', function(err, data){
    //console.log(err);
  //});

  this.on('*::install', function (hook, callback) {
    self.emit('npm::installing', hook);
    npm.install(hook, function (err, result) {
      if (err) {
        return self.emit('npm::install::error', err);
      }
      self.emit('npm::installed', result);
    });
  });
  
};