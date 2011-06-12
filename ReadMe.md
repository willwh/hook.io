






     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a full featured i/o framework for node.js
    
# v0.4.0

## Choose from an extensive library of tiny, independent, autonomous "hooks" that emit and receive messages to seamlessly compose robust i/o scenarios

## Current Status: Working, but unreleased. Polishing up the API, docs, and demos now. Publishing to npm soon.


# Features :

- Designed to build: large, decoupled, distributed, and fault tolerant I/O heavy applications in node.js
- Interprocess Message Publishing and Subscribing done through [EventEmitter2](https://github.com/hij1nx/EventEmitter2) and [dnode](http://github.com/SubStack/dnode)
- Messaging API inherits and mimics Node's native EventEmitter API ( with the help of EventEmitter2 )
- Spawning and Daemonizing of processes handled with [Forever](https://github.com/indexzero/forever)
- Easily connect / disconnect hooks "hot" without affecting other services
- Core library currently checking in at about ~120 lines of code :-)

# Available Hooks ( more coming soon )

**Core**

  - [hook.io-repl](http://github.com/marak/hook.io-repl)

**Web**
  
  - [hook.io-irc](http://github.com/marak/hook.io-irc)
  - [hook.io-twitter](http://github.com/marak/hook.io-twitter)
  - [hook.io-webhook](http://github.com/marak/hook.io-webhook)
  - [hook.io-webserver](http://github.com/marak/hook.io-webserver)


**Utility**

  - [hook.io-asyncify](http://github.com/marak/hook.io-asyncify)
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




## Basic Hook Syntax

``` js
 #!/usr/bin/env node

 var Hook = require('hook.io').Hook;
 var myhook = new Hook( { name: "helloworld"} );

 myhook.start();

   myhook.on('ready', function(){

   myhook.on('i.*', function(event, event2, data){
    console.log('I am currently getting data my inputs from: '.green + event.toString().yellow + ' ' + JSON.stringify(data).grey);
   });

   myhook.on('o.*', function(event, data){
      console.log('I am currently sending data to my ouputs on: '.green + event.toString().yellow + ' ' + JSON.stringify(data).grey);
   });

   //
   // Add some startup commands here
   //

   console.log('Now that I am ready, I will emit to my outputs'.yellow);
   myhook.emit('o.hello', 'Hello, I am ' + self.name);

 });
 
```

## Demo coming soon...
 
## Contributors ( through code and advice )

AvianFlu, Chapel, Substack, Dominic Tarr, Charlie Robbins, h1jinx, Tim Smart, tmpvar, kadir pekel
