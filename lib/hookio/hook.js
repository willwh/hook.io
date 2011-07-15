var dnode  = require('dnode'),
    util   = require('util'),
    colors = require('colors'),
    argv   = require('optimist').argv,
    nconf  = require('nconf'),
    path   = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2;


var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);

  var self = this;
  self.id = 0;
  self._outputs   = [];
  self.defaults   = {};
  options = options || {};

  // The covention of self.foo = self.foo || options.foo,
  // is being used so other classes can extend the Hook class
  self.name = self.name || options.name;

  // All servers and clients will listen and connect port 5000 by default
  self.defaults.port = argv.p || argv.port || options.port || 5000;
  self.defaults.host = argv.h || argv.host || options.host || "localhost";
  self.debug = (argv.d||argv.debug||options.debug) ? true : false;

  // nconf object mappings
  // each hook get's their own config.json file
  self.use  = nconf.use;
  self.get  = nconf.get;
  self.set  = nconf.set;
  self.load = nconf.load;
  self.save = nconf.save;
  
  self.use('file', { file: './config.json'});
  //self.use('file', { file: path.dirname(module.parent.parent.parent.filename) + '/config.json'});

  self.load();

  self.on('o.*', function(event, data){
    if (self.remote) {
      var c = event.split('.');
      self.remote.message(c[1], event, data);
    }
  });

}

util.inherits(Hook, EventEmitter);

// Would be nice to able to do this instead of manual mapping...
// util.inherits(Hook, nconf);


Hook.prototype.start = function (options, callback) {
  
  var self = this;
  
  if (!options) {
    var options = {};
  }
  
  self.port = options.port || self.defaults.port;
  self.host = options.host || self.defaults.host;
  
  if (options.server) {
    self.port = options.server;
  }
  
  //
  // Note: We always try to listen first when .start() is called
  //
  self._listen(callback);
  
};

Hook.prototype._listen = function(callback){

  var self = this;

  var server = dnode(function(client, conn){

    this.report = function (name, callback) {

      var that = this;
      that.id = 0;

      //
      // ### function checkName (name)
      // #### @name {String} Name of hook to check
      // Recurisively checks hook's name until it
      // finds an available name for hook.
      //
      function checkName(name) {
        
        var attemptedName = name + '-' + that.id;
        if (self._outputs.indexOf(attemptedName) === -1) {
          self._outputs.push(attemptedName);
          self.log(self.name, 'client connected', attemptedName);
          //console.log(self.name.magenta + ' input connected: '.green, attemptedName.magenta)
          return attemptedName;
        }
        else {
          that.id++;
          return checkName( name );
        }
      }

      callback(checkName(name, that.id), that.id);

    };

    this.message = function ( name, event, data ) {
      //console.log(self.name.magenta + ' getting input: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
      self.log(self.name, event, data);
      self.emit(self.name + '.' + name , event, data);
    }

    // Namespaced input events
    self.on('*.*', function(event, event2, data){
      client.message(event, event2, data);
    });


  });

  server.on('ready', function(){
    self.emit('listening');
    self.emit('ready');
    //console.log(self.name.magenta + ' listening on port: '.green + self.port);
    self.log(self.name, 'listening', self.port);
  });


  //
  // Note: Slight hack for basic hook discovery
  //
  // TODO: refactor try/catches out, we should be better away of current hook state
  //
  try {
    server.listen(self.port);
  }
  catch(err) {
    if (err.code == 'EADDRINUSE') {
      self.log(self.name, 'cant listen', self.port);
      //console.log(self.name.magenta + ' couldn\'t start a server on port: '.yellow + self.port + ' trying to connect instead...'.yellow);
      return self.connect();
    }
    console.log(err);
  }

}

Hook.prototype.listen = function(options, callback){
  
  var self = this, client = null;
  
  if (!options) {
    var options = {};
  }
  
  self.port = options.port || self.defaults.port;
  self.host = options.host || self.defaults.host;
  
  if (options.server) {
    self.port = options.server;
  }
  
  self._listen(callback);
  
};


Hook.prototype.connect = function (options, callback) {
  
  var self = this;

  if (!options) {
    var options = {};
  }

  self.port = self.port || options.port || self.defaults.port;
  self.host = self.host || options.host || self.defaults.host;

  var client = dnode({
    message : function (event, name, data) {
      self.emit(event, name, data);
    }
  });

  client.connect(self.port, function (remote, conn) {

    self.remote = remote;
    self.conn   = conn;

    conn.on('end',  function() {
      self.emit('end');
    });

    remote.report(self.name, function(newName, newID){

      self.name = newName;
      self.id   = newID;

      //console.log(self.name.magenta + ' connected '.green + 'to port: '.green + self.port);
      self.log(self.name, 'connected to server', self.port);
      self.emit('connected');
      self.emit('ready');

    });

  });
  
}

/*

// Worker API not quite ready yet...

Hook.prototype.worker = function (code, callback) {

  // spawn a new worker hook
  var worker = new Hook({ name: 'new-worker' });
  worker.start();

  // when he responds, fire the callback
  worker.on('i.crunch.o.crunch', function(name, event, data){

    // execute the payload, assign it to a value
    eval('var f = ' + data + ';'); // replace with new Function(), imnotsogoodatjavascript
    var r = f();

    callback(null, r);

  });

  worker.on('ready', function(){

    // throw some code on the worker hook
    worker.emit('o.crunch', code);

  });

};

*/

//
// Hook.spawn()
//
Hook.prototype.spawn = function(args, callback){
  
  var hooks   = [],
      _hooks  = {},
      _loaded = 0,
      self    = this;
  
  if (typeof args === "string") {
    hooks.push(args);
  }
  else {
    hooks = args;
  }

  //
  // Note: hard-coded to always be in_process for now
  //
  var in_process = true;
  
  for(var i = 0; i < hooks.length; i++) {

    var cmd = "hookio-" + hooks[i];

    self.log(self.name, 'spawning child', cmd);
    //console.log(self.name.magenta + ' spawning up child hook:'.yellow, cmd.grey);

    (function(hookLabel){

      //
      // Spawn hook inside the current process
      //
      if (in_process) {

        // Create empty object in memory
        _hooks[hooks[i]] = {};

        // Dynamically require hook module from npm
        _hooks[hooks[i]].module = require('hook.io-' + hooks[i]);

        // There should only be one key in the exports of the module that of type Hook...
        var key = Object.keys(_hooks[hooks[i]].module);

        // Copy Hook class to o
        _hooks[hooks[i]].Hook  = _hooks[hooks[i]].module[key[0]];
        _hooks[hooks[i]]._hook = new _hooks[hooks[i]].Hook({ "name": hooks[i] })

        //
        //  TODO: Replace this flow control with the async library
        //
        _hooks[hooks[i]]._hook.on('ready', function(){
          _loaded++;
          if(_loaded >= hooks.length) {
            callback(null, 'children ready');
          }
        });

        _hooks[hooks[i]]._hook.connect();

      }

      //
      // spawn hook using forever
      //
      else {

        //
        //  Note: Having the forever require here isn't best practice,
        //        but I didn't want to force users to install forever,
        //        if they didn't have any need for spawning out of process hooks.
        //
        //        The module cache will prevent this from reloading everytime
        //
        var forever = require('forever');
        var child = new (forever.Forever)([cmd], {
          max: 10,
          silent: false,
          logFile: '../forever' + '-hookio-' + hooks[i] + '.log'
        });

        child.on('exit', function(err){
          console.log('child hook has died: '.red, hookLabel.yellow);
        });
        child.start();

      }


    })(cmd);


  }

};


function pad(str, len){
  var s;
  s = str;
  if (str.length < len) {
    for (var i = 0; i < (len - str.length); i++) {
      s += ' '
    }
  }
  return s;
}

Hook.prototype.log = function(hook, event, data){
  data = data || 'undefined';
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  if (this.debug) {
    console.log(pad(hook, 30).magenta, pad(event, 25).green, data.toString().grey);
  }
};

