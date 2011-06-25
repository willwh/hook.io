var Hook = require('hook.io').Hook;
var myhook = new Hook( { name: "helloworld" } );


myhook.on('i.*', function(source, event, data){
  console.log('I am currently getting data on my inputs from: '.green + source.toString().yellow + ' ' + JSON.stringify(data));
});

myhook.on('o.*', function(event, data){
  console.log('I am currently sending data to my ouputs on: '.green + event.toString().yellow + ' ' + JSON.stringify(data));
});

myhook.on('ready', function(){

  //
  // Add some startup commands here
  //
  console.log('Now that I am ready, I will emit to my outputs on an interval'.yellow);
  myhook.emit('o.hello', 'Hello, I am ' + myhook.name);

  // This is just to simulate I/O, don't use timers...
  setInterval(function(){
    myhook.emit('o.hello', 'Hello, I am ' + myhook.name);
  }, 5000);

});

myhook.start();
