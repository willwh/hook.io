module['exports'] = {
  "*::getEvents": function(cb) {
    cb(null, this.getEvents());
  },
  "*::query": function (hook, cb) {
    this.query(hook, cb);
  },
  "*::install": function (hook, callback) {
    var self = this;
    self.emit('npm::installing', hook);
    npm.install(hook, function (err, result) {
      if (err) {
        return self.emit('npm::install::error', err);
      }
      self.emit('npm::installed', result);
    });
  }
};