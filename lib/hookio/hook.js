var dnode = require('dnode'),
    util  = require('util'),
    colors = require('colors'),
    argv   = require('optimist').argv,
    EventEmitter = require('eventemitter2').EventEmitter2;

var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);

  self = this;
  self.id = 0;
  self._outputs   = [];
  self.name = options.name;

  // All servers and clients will listen and connect port 5000 by default
  self.port = 5000;
  self.host = "localhost";

  if (argv.p) {
    self.port = argv.p;
  }

  if (argv.h) {
    self.host = argv.h;
  }

  self.on('o.*', function(event, data){
    var c = event.split('.');
    if (self.remote && self.remote.input) {
      c.shift();
      c.unshift('i');
      self.remote.input(c.join('.'), data);
    }
    if(self.client && self.client.input){
      self.client.input(event, data);
    }
  });

  self.on('i.*', function(event, data){
    var c = event.split('.');
    if (self.remote && self.remote.output) {
      c.shift();
      c.unshift('o');
      self.remote.output(c.join('.'), data);
    }
    if(self.client && self.client.output){
      self.client.output(event, data);
    }
  });

}

util.inherits(Hook, EventEmitter);

Hook.prototype.start = function (options, callback) {
  
  var self = this;
  
  if (!options) {
    var options = {};
  }
  
  self.port = options.port || self.port;
  self.host = options.host || self.host;
  
  if (options.server) {
    self.port = options.server;
  }
  
  self._listen();
  
};

Hook.prototype._listen = function(options, callback){

  var self = this;

  // TODO: Replace try/catch with proper error handler for server instance binding errors
  try {

    server = dnode(function(client, conn){

      self.client = client;

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
            console.log('hook input connected: '.green, attemptedName.yellow)
            return attemptedName;
          }
          else {
            that.id++;
            return checkName( name );
          }
        }
        
        callback(checkName(name, that.id), that.id);
        
      };

      this.input = function ( event, data ) {
        console.log('getting input from: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
        console.log('sending output to: '.green + ' ' + event.yellow + ' ' + JSON.stringify(data).grey);
        self.emit(event, data);
      }


    }).listen(self.port, callback);

    console.log('hook output started: '.green, self.name.yellow);

  }
  catch (err) {

    if (err.message === "EADDRINUSE, Address already in use") {
      return self.connect();
    } else {
      return console.log(err);
    }
  }
  
}

Hook.prototype.listen = function(options, callback){
  
  var self = this, client = null;
  
  if (!options) {
    var options = {};
  }
  
  self.port = options.port || self.port;
  self.host = options.host || self.host;
  
  if (options.server) {
    self.port = options.server;
  }
  
  self._listen();
  
};


Hook.prototype.connect = function (options, callback) {
  
  var self = this;

  if (!options) {
    var options = {};
  }

  self.port = options.port || self.port;
  self.host = options.host || self.host;
  var client = dnode({
    input : function (event, data) {
      self.emit(event, data);
    }
  });

  client.connect(self.port, function (remote, conn) {

    self.remote = remote;
    self.conn   = conn;

    remote.report(self.name, function(newName, newID){

      self.name = newName;
      self.id   = newID;
      console.log('I have connected to an output, my name there is: '.green + newName.yellow)
      self.emit('ready');

    });

  });
  
}

// Hook.spawn() 
// Uses forever to spawn up more hooks programatically

/* TODO: Move to new hook 
Hook.prototype.spawn = function(args){
  
  var hooks = [];
  
  if (typeof args === "string") {
    hooks.push(args);
  }
  else {
    hooks = args;
  }
  
  // TODO: remove hard-coded path and replace with npm lookup / system lookup
  for(var i = 0; i < hooks.length; i++) {
    var child = new (forever.Forever)(__dirname+'/../../hooks/'+hooks[i], {
      max: 10,
      silent: false,
      logFile: '../forever.log',
      options: [hooks, 5000]
    });
    //child.on('exit', self.callback);
    child.start();
  }
  
};
*/