/* hook.io core */

var sys    = require('sys'),
    eyes   = require('eyes'),
    http   = require('http'),
    hookio = require('../hookio'), cradle = require('cradle');

exports.start = function(){

  /** 
      startup basic http server that will eventually manage hook.io 
      this server will continously run, meaning hook.io will always stay on
  
  **/
  sys.puts('> hook.io server started on port 8080');
  http.createServer(function(req, res){
    
    sys.puts('request in');
    res.writeHead(200);
    res.write('hook server up');
    res.end();
    
  }).listen(8080);
  
  /** 
    
      init the Hook model
      
  **/
//  eyes.inspect(hookio);
  hookio.Hooks.init();
  
  /**
  
      // TODO: put conditional here to check if we need to run seed
      seed();

  **/

  /** 
  
      startup available hook.io services
  
  **/

  for(var service in hookio.services){
    hookio.services[service].start();
  }
 // eyes.inspect(hookio.services);
  
};


// if this is the first time we are starting up the hook.io server, we are going to need to run some seed configurations
var seed = exports.seed = function(){
  
   var db = new(cradle.Connection)({ host: 'localhost' }).database("hookio-dev");
   
   db.destroy(function () {
     db.create(function (e) {
       hookio.Hooks.on('init', function () {
         // Populate the database with any data we should be aware of
         //Hooks.bootstrap(data.apps);
       });

       /*
       data.design.forEach(function(design) {
         db.insert(design._id, design.views );
       });
       */
       
     });
   });
  
};