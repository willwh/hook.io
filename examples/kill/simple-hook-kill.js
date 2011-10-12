/*
 * Creates a server hook, 2 client hooks, one client stops listening to the server
 */

var Hook = require('../../lib/hookio').Hook,
    Helloworld = require('hook.io-helloworld').Helloworld;

var hook = new Hook({
  name: "server-hook",
  debug: "true"
});

hook.on('hook::ready', function() {
  setInterval(function() {
    hook.emit('hello', hook.name);
  }, 1000);
});

hook.start();

var client = new Helloworld({
  name: "client-hook",
  debug: "true"
});

client.on('hook::ready', function() {
  setTimeout(function(){
    client.kill();
  }, 9999);
});

client.start();
