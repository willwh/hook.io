var dnode = require('dnode'),
    util  = require('util'),
    colors = require('colors'),
    forever = require('forever'),
    EventEmitter = require('./EventEmitter2').EventEmitter2;

var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);
  
  self = this;
  
  self.downstreams = [];
  self.upstreams   = [];

  self._upstreams   = [];
  
  self.name = options.name;
  
  self.on('out.*', function(event, data){
    
    self.remote.input(self.name, event, data);
    
  });
  
}

util.inherits(Hook, EventEmitter);

// Starts up a new Hook server
Hook.prototype.listen = function(options, callback){
  
  var self = this, client = null;
  
  self.port = options.port;
  self.host = options.host;
  
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

    // Generic input events, not being used in this demo
    self.on('in', function(name, data){
      console.log('generic input');
      self._soldiers.forEach(function(soldier){
        client.input(soldier, data);
      });
    });
    
    // Namespaced input events
    self.on('in.*', function(event, event2, data){
      client.input(event, event2, data);
    });
    
  }).listen(this.port, callback);
  
};


Hook.prototype.connect = function (options, callback) {
  
  var self = this;

  self.port = options.port;
  self.host = options.host;
  
  var client = dnode({
    input : function (event, name, data) {
      //console.log(event, name,  data);
      self.emit(event, name, data);
    }
  });
  
  client.connect(self.port, function (remote, conn) {
    remote.report(self.name)
    self.remote = remote;
    self.conn   = conn;

    self.emit('ready');
    //callback(null, true);
  });
}


Hook.prototype.spawn = function(){
  
  for(var i = 0; i < self.soldiers.length; i++) {
    var child = new (forever.Forever)(__dirname+'/../bin/'+self.soldiers[i], {
      max: 10,
      silent: false,
      logFile: '../forever.log',
      options: [self.soldiers[i], 5000]
    });
    //child.on('exit', self.callback);
    child.start();
  }
  
};
