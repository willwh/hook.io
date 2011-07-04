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
  self.defaults.port = options.port || 5000;
  self.defaults.host = options.host || "localhost";


  if (argv.p) {
    self.port = argv.p;
  }

  if (argv.h) {
    self.host = argv.h;
  }

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

  // Event listeners
  self.on('i.*', function(event, data){
    if (self.remote) {
      var c = event.split('.');
      if(c[0] != 'i' || c[1] != self.name) {
        try {
          self.remote.output(c[1], event, data);
        } catch(err) {
          //console.log(err);
        }
      } 
    }
  });

  self.on('o.*', function(event, data){
    if (self.remote) {
      var c = event.split('.');
      if(c[0] != 'o' || c[1] != self.name) {
        self.remote.input(c[1], event, data);
      } 
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
          console.log(self.name.magenta + ' input connected: '.green, attemptedName.magenta)
          return attemptedName;
        }
        else {
          that.id++;
          return checkName( name );
        }
      }

      callback(checkName(name, that.id), that.id);

    };

    this.input = function ( name, event, data ) {
      console.log(self.name.magenta + ' getting input: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
      //console.log('sending output to: '.green + ' ' + event.yellow + ' ' + JSON.stringify(data).grey);
      self.emit('i.' + name + '.' + event, event, data);
    }

    /*
    this.output = function ( name, event, data ) {
      console.log('getting output from: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
      self.emit('o.' + name + '.' + event, event, data);
    }
    */

    // Namespaced input events
    self.on('i.*', function(event, event2, data){
      try {
        client.input(event, event2, data);
      } catch(err) {
      }
    });

    // Namespaced output events
    self.on('o.*', function(event, event2, data){
      try {
        client.output(event, event2, data);
      } catch(err) {
      }
    });



  });

  server.on('ready', function(){
    //console.log('ready event fired');
    self.emit('listening');
    self.emit('ready');
    console.log(self.name.magenta + ' listening on port: '.green + self.port);
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
      console.log(self.name.magenta + ' couldn\'t start a server on port: '.yellow + self.port + ' trying to connect instead...'.yellow);
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
    input : function (event, name, data) {
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

      console.log(self.name.magenta + ' connected '.green + 'to port: '.green + self.port);
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
Hook.prototype.spawn = function(args){
  
  var hooks = [],
      _hooks = {},
      self   = this;
  
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

    console.log(self.name.magenta + ' spawning up child hook:'.yellow, cmd.grey);

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

  console.log(_hooks[hooks[i]]);
  
};

