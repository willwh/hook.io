var dnode = require('dnode'),
    util  = require('util'),
    colors = require('colors'),
    forever = require('forever'),
    EventEmitter = require('EventEmitter2').EventEmitter2;

var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);
  
  self = this;
  
  self.downstreams = [];
  self.upstreams   = [];

  self._upstreams   = [];
  
  self.name = options.name;
  
  self.on('out.*', function(event, data){
    // Don't re-emit events to yourself
    var c = event.split('.');
    if(c[0] != 'in' && c[1] != self.name) {
      self.remote.input(self.name, event, data);
    }
  });
  
}

util.inherits(Hook, EventEmitter);

// Starts up a new Hook server
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
  
  
  dnode(function(client, conn){
    this.report = function (name) { 
      
      console.log(name.yellow, ' has connected.'.green);
      if (self._upstreams.indexOf(name) === -1) {
        self._upstreams.push(name);
      }
    };
    
    this.input = function ( soldier, event, data ) {
      self.emit('in.' + soldier + '.' + event, event, data);
    }

    // Namespaced input events
    self.on('in.*', function(event, event2, data){
      client.input(event, event2, data);
    });
    
  }).listen(self.port, callback);
  
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
      //console.log(event, name,  data);
      self.emit(event, name, data);
    }
  });
  console.log('crap');
  client.connect(self.port, function (remote, conn) {
    remote.report(self.name)
    self.remote = remote;
    self.conn   = conn;

    self.emit('ready');
    //callback(null, true);
  });
  
  client.on('error', function(err){
    
    console.log('we got an error', err);
    
  });
}


Hook.prototype.spawn = function(args){
  
  var hooks = [];
  
  if (typeof args === "string") {
    hooks.push(args);
  }
  else {
    hooks = args;
  }
  
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
