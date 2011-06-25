var Hook = require('hook.io').Hook;
var hook = new Hook({ name: 'simple-output' });

hook.listen();

// write some sync code
var fn = function(){
  var x = JSON.parse('{"asd":"bar"}'); 
  return x;
}

// prepare the fn for transport
var code = fn.toString();

// this will execute code on new process with callback
// you can optionally pass in a dnode connection object
hook.worker(code, function(err, result){
  console.log(result);
});
