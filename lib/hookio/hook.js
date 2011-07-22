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
    nconf  = require('nconf'),
    path   = require('path'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    hookio = require('../hookio'),
    argv   = hookio.cli.argv;
    
//
// ### function Hook (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Hook object responsible for managing
// dnode based IPC.
//
var Hook = exports.Hook = function (options) {
  //
  // TODO: We should make events Arrays and there should be options
  // which can be passed to the `EventEmitter2` constructor function. 
  //
  EventEmitter.call(this, { delimiter: '::' });

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
  this.name = this.name || options.name || argv['hook-name'];

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
  self.on('message::*', function (event, data) {
    if (self.remote) {
      var c = event.split('::');
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
    
    if (callback) {
      callback.apply(null, arguments);
    }
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

  client.connect(this._dnodeOptions(), function (remote, conn) {
    self.conn   = conn;
    self.remote = remote;
    
    conn.on('end', function () {
      self.emit('connetion::end');
    });

    remote.report(self.name, function (newName, newID) {
      self.name = newName;
      self.id   = newID;

      self.log(self.name, 'connected to server', self.port);

      self.emit('hook::connected');
      self.emit('hook::ready');
    });
  });
};

//
// ### function spawn (hooks, callback)
// #### @hooks {string|Array|Object} Hook types to spawn as children to this instance
// #### @callback {function} Continuation to respond to when complete
// Spawns the specified `hooks` as children to the current `Hook` instance.
//
Hook.prototype.spawn = function (hooks, callback) {
  var self = this, 
      local;
    
  //
  // Liberally parse the `hooks` parameter. See `_spawnOptions` for
  // more code documentation.
  //
  hooks = self._spawnOptions(hooks);
  
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
        options,
        child,
        keys;
    
    self.log(self.name, 'spawning child', hook);
    
    if (local) {
      //
      // Create empty object in memory and dynamically require hook module from npm
      //
      self.children[name] = {
        module: require(hook)
      };

      //
      // Here we assume that the `module.exports` of any given `hook.io-*` module
      // has **exactly** one key. We extract this Hook prototype and instantiate it.
      //
      keys = Object.keys(self.children[name].module);
      self.children[name].Hook  = self.children[name].module[keys[0]];
      self.children[name]._hook = new (self.children[name].Hook)(hooks[name]);

      //
      // When the hook has fired the `hook::ready` event then continue.
      //
      self.children[name]._hook.once('hook::ready', next.bind(null, null));
      self.children[name]._hook.connect(self);
    }
    else {
      try { hookBin = require.resolve(hookBin) }
      catch (ex) { return next(ex) }
      
      //
      // TODO: Make `max` and `silent` configurable through the `hook.config`
      // or another global config.
      //
      options = {
        max: 10,
        silent: false,
        logFile: path.join('./forever-' + hook)
      };

      if (typeof hooks[name] === 'object') {
        //
        // If a proper configuration is available for this 
        // out-of-process hook then serialize it into cli options
        // to be passed through forever. 
        //
        options.options = self._cliOptions(hooks[name]);
      }

      child = new (hookio.forever.Monitor)(hookBin, options);
      child.on('start', function onStart (_, data) {
        //
        // Bind the child into the children and move on to the next hook
        //
        self.children[name] = {
          bin: hookBin,
          monitor: child
        };
        
        self.emit('child::start', hooks[name], self.children[name]);
        next();
      });
      
      child.on('restart', function () {
        self.emit('child::restart', hooks[name], self.children[name]);
      });
      
      child.on('exit', function (err) {
        //
        // Remark: This is not necessarily a bad thing. Hooks are not by definition
        // long lived processes (i.e. worker-hooks, tbd).
        //
        self.log('child hook has died: '.red, hook.yellow);
        self.emit('child::exit', hooks[name], self.children[name]);
      });

      child.start(); 
    }
  }
  
  async.forEach(Object.keys(hooks), spawnHook, function (err) {
    self.emit(err ? 'children::error' : 'children::ready', err);
    
    if (callback) {
      callback(err);
    }
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

//
// ### @private function _spawnOptions (hooks)
// #### @hooks {Array|Object|string} Descriptions of hooks to spawn
// Liberally parses the `hooks` argument whether it be an Array, Object or string
// describing a set of hooks to spawn.
//
// ['foo', { name: 'bar', port: 5002 }] ==> { foo: { name: 'foo' }, bar: { name: 'bar', port: 5002 } }
//
Hook.prototype._spawnOptions = function (hooks) {
  var self = this,
      options = {};
  
  function parse (value, name) {
    switch (typeof value) {
      case 'string': 
        name = value;
        options[value] = { name: value };
        break;
      case 'object':
        if (!name && !value.name) {
          throw new Error('Cannot spawn child hook without name');
        }
        
        value.name = value.name || name;
        options[name] = value;
        break;
      default: 
        throw new Error('Argument error');
    }
    
    //
    // Setup default hook options 
    //
    options[name].host = options[name].host || self.host;
    options[name].port = options[name].port || self.port;
  }
  
  if (Array.isArray(hooks)) {
    hooks.forEach(parse);
  }
  else if (typeof hooks === 'object') {
    Object.keys(hooks).forEach(function (key) {
      parse(hooks[key], key);
    });
  }
  else {
    //
    // If `hooks` is not an Array and not an `Object` then it is a
    // single variable configure the options hash accordingly
    //
    parse(hooks);
  }
  
  return options;
};

//
// ### @private function _cliOptions (options)
// #### @options {Object} Object to serialize into command-line arguments.
// Serializes the specified `options` into a space delimited, double-dash `--`
// set of command-line arguments.
//
//    {
//      host: 'localhost',
//      port: 5010,
//      name: 'some-hook-name',
//      options: { custom: 'foo' }
//    }
//
//    --hook-host localhost --hook-port 5010 --hook-name some-hook-name --custom foo
//
Hook.prototype._cliOptions = function (options) {
  var cli = [];
  
  Object.keys(options).forEach(function (key) {
    if (key === 'options') {
      return;
    }
    
    //
    // TODO: Some type inspection to ensure that only
    // literal values are accepted here.
    //
    cli.push('--hook-' + key, options[key]);
  });
  
  if (options.options) {
    Object.keys(options.options).forEach(function (key) {
      cli.push('--' + key, options.options[key]);
    });
  }
  
  return cli;
};

//
// ### @private function _dnodeOptions ()
// Returns an Object literal for this instance to be passed
// to various dnode methods
//
Hook.prototype._dnodeOptions = function () {
  return {
    port:      this.port,
    path:      this.socket,
    key:       this.key,
    block:     this.block,
    reconnect: this.reconnect
  };
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
      self.emit(self.name + '::' + name , event, data);
    };

    // Namespaced input events
    self.on('*::*', function (event, event2, data) {
      client.message(event, event2, data);
    });
  });
  
  server.on('connection', function (conn) {
    self.emit('connection::open', conn);
  });

  server.on('ready', function () {
    self.emit('hook::listening');
    self.emit('hook::ready');
    self.log(self.name, 'hook::listening', self.port);
  });

  //
  // Remark: Hook discovery could be improved, but needs the semantic
  // and cardinality to be better defined.
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
