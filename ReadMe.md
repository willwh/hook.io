






     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a full featured i/o framework for node.js
    
# v0.4.0

## Choose from an extensive library of tiny, independent, autonomous "hooks" that emit and receive messages to seamlessly compose robust i/o scenarios

# Features :

- Designed to build: large, decoupled, distributed, and fault tolerant I/O heavy applications in node.js
- Create hooks on ANY device that supports JavaScript ( cross-browser support via [socket.io](http://socket.io) )
- Can easily scale any tcp based messaging infrastructure ( such as clustering socket.io chat rooms in memory ) 
- Interprocess Message Publishing and Subscribing done through [EventEmitter2](https://github.com/hij1nx/EventEmitter2) and [dnode](http://github.com/SubStack/dnode)
- Messaging API inherits and mimics Node's native EventEmitter API ( with the help of EventEmitter2 )
- Spawning and Daemonizing of processes handled with [Forever](https://github.com/indexzero/forever)
- Easily connect / disconnect hooks "hot" without affecting other services
- Core library currently checking in at about ~150 lines of code

# Available Hooks ( more coming soon )

**Core**

  - [hook.io-helloworld](http://github.com/marak/hook.io-repl)
  - [hook.io-repl](http://github.com/marak/hook.io-repl)

**Web**
  
  - [hook.io-irc](http://github.com/marak/hook.io-irc)
  - [hook.io-twitter](http://github.com/marak/hook.io-twitter)
  - [hook.io-webhook](http://github.com/marak/hook.io-webhook)
  - [hook.io-webserver](http://github.com/marak/hook.io-webserver)


**Utility**

  - [hook.io-asyncify](http://github.com/marak/hook.io-asyncify)
  - [hook.io-coffeescript](http://github.com/marak/hook.io-coffeescript)
  - [hook.io-levenshtein](https://github.com/AvianFlu/hook.io-levenshtein)
  - [hook.io-logger](http://github.com/marak/hook.io-logger)
  - [hook.io-jsdom](http://github.com/tmpvar/hook.io-jsdom)
  
**Humor**

  - [hook.io-insult](http://github.com/marak/hook.io-insult)

## TODO

  - Create better demos
  - Release more hooks
  - Create Flow Chart explaining architecture
  - Add a config.json per hook using nconf
  - Add ability to pass in argv data
  - Create better system for automatically loading inputs via forever
  - Refactor [kohai](http://github.com/nodejitsu/kohai) bot to use hook.io


# Getting Start / Demo

     npm install hook.io-helloworld -g

Now run:

     hookio-helloworld
     
Spawn up as many as you want. The first one becomes an `output` ( server ), the rest will become `inputs` ( clients ). Each helloworld input will emit a hello on an interval. Now watch the i/o party!     

If you want to start logging all these messages simply install `hookio-logger` with:

    npm install hook.io-helloworld -g
    

Now run:

    hookio-logger
    
You will now start logging all these messages. 


## Dual-sided hooks

Both the helloworld and logger hooks act as dual-sided hooks by default. The order you run `hookio-logger` and `hookio-helloworld` does not matter.  They can work as both clients or servers ( inputs or outputs ) and will interface seamlessly using hook.io's default settings.


## Basic Hello World Syntax
http://github.com/avianflu/hook.io-helloworld


``` js
#!/usr/bin/env node

  var Hook = require('hook.io').Hook;
  var myhook = new Hook( { name: "helloworld"} );

  myhook.start();

  myhook.on('i.*', function(event, event2, data){
    console.log('I am currently getting data on my inputs from: '.green + event.toString().yellow + ' ' + JSON.stringify(data).grey);
  });

  myhook.on('o.*', function(event, data){
    console.log('I am currently sending data to my ouputs on: '.green + event.toString().yellow + ' ' + JSON.stringify(data).grey);
  });

  myhook.on('ready', function(){

    //
    // Add some startup commands here
    //
    console.log('Now that I am ready, I will emit to my outputs on an interval'.yellow);
    myhook.emit('o.hello', 'Hello, I am ' + self.name);

    // This is just to simulate I/O, don't use timers...
    setInterval(function(){
      myhook.emit('o.hello', 'Hello, I am ' + self.name);
    }, 5000);

  });

 
```

## Basic HTTP post / receive Webhook server
http://github.com/marak/hook.io-webhook

``` js

var Hook = require('hook.io').Hook,
    http = require('http');

var webhook = new Hook( { name: 'webhook' });

webhook.listen();

http.createServer(function(req, res){
  
  var body = '';
  
  req.on('data', function(data){
    body += data;
  });
  
  req.on('end', function(){
    webhook.emit('o.request', {
     request: {
       url: req.url
     },
     body: body 
    })
    res.end();
  });
  
}).listen(9000);

console.log('http webhook server started on port '.green + '9000'.yellow);
```

## Screencasts coming soon...
 
## Contributors ( through code and advice )

AvianFlu, Chapel, Substack, Dominic Tarr, Charlie Robbins, h1jinx, Tim Smart, tmpvar, kadir pekel
