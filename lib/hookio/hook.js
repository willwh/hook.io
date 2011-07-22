/*
 * hook.js: Core hook object responsible for managing dnode-based IPC.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */
 
var async  = require('async'),
    dnode  = require('dnode'),
    util   = require('util'),
    colors = require('colors'),
    argv   = require('optimist').argv,
    nconf  = require('nconf'),
    path   = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    hookio = require('../hookio');
    
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
  this.id       = 0;
  this._outputs = [];
  this.defaults = {};
  this.children = {};

  //
  // The covention of self.foo = self.foo || options.foo,
  // is being used so other classes can extend the Hook class
  //
  this.name = this.name || options.name;

  //
  // All servers and clients will listen and connect port 5000 by default
  //
  this.debug           = argv.debug === true || options.debug === true;
  this.defaults.port   = argv['hook-port']   || options.port   || 5000;
  this.defaults.host   = argv['hook-host']   || options.host   || 'localhost';
  this.defaults.socket = argv['hook-socket'] || options.socket || null;
  
  // 
  // Each hook get's their own config.json file managed
  // by an instance of the `nconf.Provider`.
  //
  // Remark: This configuration path needs to load from a 
  // default configuration file and then write to a custom 
  // configuration file based on the hook `type/name` combo. 
  //
  this.config = new nconf.Provider();
  this.config.use('file', { file: './config.json' });
  this.config.load();
  
  //
  // TODO: Merge in defaults from code, and not the config.json
  //

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

//
// ### function start (options, callback) 
// #### @options {Object} Options to use when starting this hook.
// #### @callback {function} Continuation to respond to when complete
// Attempts to spawn the hook server for this instance. If a server already
// exists for those `options` then attempt to connect to that server.
//
Hook.prototype.start = function (options, callback) {  
  var self = this;

  //
  // Remark: (indexzero) `.start()` should do more lookup
  // table auto-discovery before calling `.listen()` but
  // that's a work in progress
  //
  this.listen(options, function (err) {
    if (err.code == 'EADDRINUSE') {
      self.log(self.name, 'cant listen', self.port);
      return self.connect(options, callback);
    }
    
    callback.apply(null, arguments);
  });
};

//
// ### function listen (options, callback) 
// #### @options {Object} Options to use when listening for this hook server.
// #### @callback {function} Continuation to respond to when complete
// Attempts to spawn the hook server for this instance. 
//
Hook.prototype.listen = function (options, callback) { 
  if (!callback && typeof options === 'function') {
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

//
// ### function connect (options, callback) 
// #### @options {Object} Options to use when starting this hook.
// #### @callback {function} Continuation to respond to when complete
// Attempt to connect to a hook server using the specified `options`.
//
Hook.prototype.connect = function (options, callback) {
  if (!callback && typeof options === 'function') {
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

    conn.on('end', function () {
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
  var self = this, 
      local;
  
  if (!Array.isArray(hooks)) {
    hooks = [hooks];
  }
  
  if (typeof hookio.forever === 'undefined') {
    //
    // Attempt to `require('forever')` and if it is available
    // then spawn all 
    //
    try {
      hookio.forever = require('forever');
    }
    catch (ex) {
      //
      // Remark: Should we be warning the user here?
      //
      hookio.forever = ex;
    }
  }
  
  //
  // Spawn in-process (i.e. locally) if `hookio.forever` has been set
  // purposefully to `false` or if it is an instance of an `Error` 
  // (i.e. it had previously failed to be required). 
  //
  local = self.local || !hookio.forever || hookio.forever instanceof Error;

  function spawnHook (name, next) {
    var hook = 'hook.io-' + name,
        hookBin = path.join(hook, 'bin', name),
        keys;
    
    self.log(self.name, 'spawning child', hook);
    
    if (local) {
      //
      // Create empty object in memory and dynamically require hook module from npm
      //
      self.children[hook] = {
        module: require(hook)
      };

      //
      // Here we assume that the `module.exports` of any given `hook.io-*` module
      // has **exactly** one key. We extract this Hook prototype and instantiate it.
      //
      keys = Object.keys(self.children[hook].module);
      self.children[hook].Hook  = self.children[hook].module[keys[0]];
      self.children[hook]._hook = new (self.children[hook].Hook)({ 'name': hook })

      //
      // When the hook has fired the `ready` event then continue.
      //
      self.children[hook]._hook.once('ready', function () {
        next();
      });
      
      self.children[hook]._hook.connect(self);
    }
    else {
      try {
        hookBin = require.resolve(hookBin);
      }
      catch (ex) {
        return next(ex);
      }
      
      //
      // TODO: Allow bin options to be passed through to the `forever.Monitor` instance
      //
      var child = new (hookio.forever.Monitor)(hookBin, {
        max: 10,
        silent: false,
        logFile: path.join('./forever-' + hook)
      });

      child.on('start', function spawnOnChildStart (_, data) {
        // bind the child into the childrens
        self.children[hook] = {
          bin : hookBin,
          _hook : child
        };
        
        // and move on to the next thing
        next();
      });
      
      child.on('exit', function (err) {
        //
        // Remark: This is not necessarily a bad thing. Hooks are not by definition
        // long lived processes (i.e. worker-hooks, tbd).
        //
        console.log('child hook has died: '.red, hook.yellow);
      });

      child.start(); 
    }
  }
  
  async.forEach(hooks, spawnHook, function (err) {
    if (err) {
      self.emit('children:error', err);
      callback(err);
      return;
    }

    self.emit('children:ready');
    callback();
  });
  
  return this;
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
  catch (ex) {
    if (callback) {
      return callback(ex);
    }
    
    self.emit('error', ex);
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
