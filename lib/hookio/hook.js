/*
 * hook.js: Core hook object responsible for managing dnode-based IPC.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */
 
var dnode  = require('dnode'),
    util   = require('util'),
    colors = require('colors'),
    argv   = require('optimist').argv,
    nconf  = require('nconf'),
    path   = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2;

//
// ### function Hook (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Hook object responsible for managing
// dnode based IPC.
//
var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);

  options = options || {};

  //
  // Setup some intelligent defaults.
  //
  this.id         = 0;
  this._outputs   = [];
  this.defaults   = {};

  //
  // The covention of self.foo = self.foo || options.foo,
  // is being used so other classes can extend the Hook class
  //
  this.name = this.name || options.name;

  //
  // All servers and clients will listen and connect port 5000 by default
  //
  this.debug         = (argv.d || argv.debug || options.debug) ? true : false;
  this.defaults.port = argv.p || argv.port || options.port || 5000;
  this.defaults.host = argv.h || argv.host || options.host || 'localhost';
  
  // 
  // Each hook get's their own config.json file managed
  // by an instance of the `nconf.Provider`.
  //
  this.config = new nconf.Provider();
  this.config.use('file', { file: './config.json'});
  this.config.load();

  var self = this;
  self.on('message.*', function (event, data) {
    if (self.remote) {
      var c = event.split('.');
      self.remote.message(c[1], event, data);
    }
  });
};

//
// Inherit from `EventEmitter2`.
//
util.inherits(Hook, EventEmitter);

Hook.prototype.start = function (options, callback) {  
  //
  // Remark: (indexzero) `.start()` should do more lookup
  // table auto-discovery before calling `.listen()` but
  // that's a work in progress
  //
  this.listen(options, callback);
};

Hook.prototype.listen = function (options, callback) { 
  if (!callback) {
    callback = options;
    options = {};
  }
  
  options = options || {};
  
  this.port = options.port || this.defaults.port;
  this.host = options.host || this.defaults.host;
  
  if (options.server) {
    this.port = options.server;
  }
  
  this._listen(callback);
};


Hook.prototype.connect = function (options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  
  options = options || {};
  this.port = this.port || options.port || this.defaults.port;
  this.host = this.host || options.host || this.defaults.host;

  var self = this, 
      client;
      
  client = dnode({
    message: function (event, name, data) {
      self.emit(event, name, data);
    }
  });

  client.connect(this.port, function (remote, conn) {
    self.remote = remote;
    self.conn   = conn;

    conn.on('end', function() {
      self.emit('end');
    });

    remote.report(self.name, function (newName, newID) {
      self.name = newName;
      self.id   = newID;

      self.log(self.name, 'connected to server', self.port);
      self.emit('connected');
      self.emit('ready');
    });
  });
};

//
// Hook.spawn()
//
Hook.prototype.spawn = function (hooks, callback) {
  var self      = this,
      inProcess = true,
      _hooks    = {},
      _loaded   = 0;

  if (!Array.isArray(hooks)) {
    hooks = [hooks];
  }

  for (var i = 0; i < hooks.length; i++) {
    (function (hookLabel) {
      self.log(self.name, 'spawning child', hookLabel);
      
      //
      // Spawn hook inside the current process
      //
      if (inProcess) {

        // Create empty object in memory
        _hooks[hooks[i]] = {};

        // Dynamically require hook module from npm
        _hooks[hooks[i]].module = require('hook.io-' + hooks[i]);

        // There should only be one key in the exports of the module that of type Hook...
        var key = Object.keys(_hooks[hooks[i]].module);

        // Copy Hook class to o
        _hooks[hooks[i]].Hook  = _hooks[hooks[i]].module[key[0]];
        _hooks[hooks[i]]._hook = new _hooks[hooks[i]].Hook({ 'name': hooks[i] })

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
        var child = new (forever.Forever)(cmd, {
          max: 10,
          silent: false,
          logFile: '../forever' + '-hookio-' + hooks[i] + '.log'
        });

        child.on('exit', function(err){
          console.log('child hook has died: '.red, hookLabel.yellow);
        });
        
        child.start();

      }
    })('hookio-' + hooks[i]);
  }
};

Hook.prototype.log = function (hook, event, data) {
  data = data || '';
  
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  
  if (this.debug) {
    console.log(pad(hook, 30).magenta, pad(event, 25).green, data.toString().grey);
  }
};

Hook.prototype._listen = function (callback) {
  var self = this, 
      server;

  server = dnode(function (client, conn) {
    this.report = function (name, callback) {
      var that = this;
      that.id = 0;

      //
      // ### function checkName (name)
      // #### @name {String} Name of hook to check
      // Recurisively checks hook's name until it
      // finds an available name for hook.
      //
      function checkName (name) {
        var attemptedName = name + '-' + that.id;
        if (self._outputs.indexOf(attemptedName) === -1) {
          self._outputs.push(attemptedName);
          self.log(self.name, 'client connected', attemptedName);
          return attemptedName;
        }
        else {
          that.id++;
          return checkName(name);
        }
      }

      callback(checkName(name, that.id), that.id);
    };

    this.message = function (name, event, data) {
      self.log(self.name, event, data);
      self.emit(self.name + '.' + name , event, data);
    };

    // Namespaced input events
    self.on('*.*', function (event, event2, data) {
      client.message(event, event2, data);
    });
  });

  server.on('ready', function () {
    self.emit('listening');
    self.emit('ready');
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
  catch (err) {
    if (err.code == 'EADDRINUSE') {
      self.log(self.name, 'cant listen', self.port);
      return self.connect();
    }
  }
};

function pad (str, len) {
  var s;
  s = str;
  if (str.length < len) {
    for (var i = 0; i < (len - str.length); i++) {
      s += ' '
    }
  }
  return s;
}