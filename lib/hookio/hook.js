var dnode  = require('dnode'),
    util   = require('util'),
    colors = require('colors'),
    argv   = require('optimist').argv,
    nconf  = require('nconf'),
    EventEmitter = require('eventemitter2').EventEmitter2;
function log(){
  console.log(arguments[0]);
};
var Hook = exports.Hook = function (options) {
  EventEmitter.call(this);

  var self = this;
  self.id = 0;
  self._outputs   = [];

  // The covention of self.foo = self.foo || options.foo,
  // is being used so other classes can extend the Hook class
  self.name = self.name || options.name;

  // All servers and clients will listen and connect port 5000 by default
  self.port = self.port || 5000;
  self.host = self.host || "localhost";

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
  
  self.use('file', {file: './config.json'});
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
            log('hook input connected: '.green, attemptedName.yellow)
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
        log('getting input from: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
        //console.log('sending output to: '.green + ' ' + event.yellow + ' ' + JSON.stringify(data).grey);
        self.emit('i.' + name + '.' + event, event, data);
      }

      /*
      this.output = function ( name, event, data ) {
        console.log('getting output from: '.green + event.yellow + ' ' + JSON.stringify(data).grey);
        self.emit('o.' + name + '.' + event, event, data);
      }
      */

      // TODO: refactor try/catches out, we should be better away of current hook state

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

    }).listen(self.port, 'localhost', function(){

      // This should work, wtf.
      /*
      self.emit('listening');
      self.emit('ready');
      console.log('ready');
      log('hook output started: '.green, self.name.yellow);
      */

    });

    // This is a hack. 
    // The above .listen() callback SHOULD fire
    // I'm not sure what is broken and causing it to not fire
    // In the mean-time, I think this will give you a better chance
    // of winning the race condition...awesome.
    // TODO: please fix this.
    process.nextTick(function () {
      self.emit('listening');
      self.emit('ready');
      log('hook output started: '.green, self.name.yellow);
    });
    
  }
  catch (err) {
    if (err.message === "EADDRINUSE, Address already in use") {
      return self.connect();
    } else {
      return log(err);
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
      log('I have connected to an output, my name there is: '.green + newName.yellow)
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