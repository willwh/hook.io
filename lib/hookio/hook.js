var dnode = require('dnode'),
    util  = require('util'),
    colors = require('colors'),
    forever = require('forever'),
    EventEmitter = require('eventemitter2').EventEmitter2;

var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);
  
  self = this;
  self.id = 0;
  self._outputs   = [];
  
  // TODO: implement _outputs outgoing client connections, but not until you can prove to me you need it
  // self._downstreams   = [];
  
  self.name = options.name;
  
  self.on('o.*', function(event, data){

    // TODO: Refactor this block
    // Don't re-emit events to yourself
    var c = event.split('.');
    if(c[0] != 'i' && c[1] != self.name) {
      self.remote.input(self.name, event, data);
    }
  });
  
}

util.inherits(Hook, EventEmitter);



Hook.prototype.start = function (options, callback) {
  
  var self = this;
  
  if (!options) {
    var options = {};
  }
  
  self.port = options.port || 5000;
  self.host = options.host || 'localhost';
  
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
        
        callback(checkName(name));
        
      };

      this.input = function ( name, event, data ) {
        //console.log('server emitting to inputs');
        //console.log(name, event, data);
        self.emit('i.' + name + '.' + event, event, data);
      }

      // Namespaced input events
      self.on('i.*', function(event, event2, data){
        
        
        //console.log('emitter calling to client');
        //console.log(event, event2, data);
        
        
        client.input(event, event2, data);
      });

    }).listen(self.port, callback);
    
    console.log('hook output started: '.green, self.name.yellow)
    
    
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
  
  self.port = options.port || 5000;
  self.host = options.host || 'localhost';
  
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

  self.port = options.port || 5000;
  self.host = options.host || 'localhost';
  
  var client = dnode({
    input : function (event, name, data) {
      // console.log('client getting input');
      // console.log(event, name,  data);
      self.emit(event, name, data);
    }
  });

  client.connect(self.port, function (remote, conn) {

    self.remote = remote;
    self.conn   = conn;

    remote.report(self.name, function(newName){
      
      self.name = newName;
      
      console.log('I have connected to an output, my name there is: '.green + newName.yellow)
      
      self.emit('ready');
      
    });


    // before the client is ready, let's make sure we have a unique name

    //callback(null, true);
  });
  
}

// Hook.spawn() 
// Uses forever to spawn up more hooks programatically
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
