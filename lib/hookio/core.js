/* hook.io core */

var sys  = require('sys'),
    eyes = require('eyes'),
    http = require('http'),
    hookio = require('../hookio');

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
  
      startup availble hook.io services
  
  **/
  for(var service in hookio.services){
    hookio.services[service].start();
  }
  eyes.inspect(hookio.services);
  
};