
     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a full featured i/o framework for node.js
    
# v0.5.2

## hook.io creates a distributed node.js EventEmitter that works cross-process / cross-platform / cross-browser. Think of it like a real-time event bus that works anywhere JavaScript is supported.

## You create custom i/o scenarios by picking and choosing from an extensive library of tiny, independent, autonomous "hooks" that seamlessly work together.

# Features :

- Build large, decoupled, distributed, and fault tolerant I/O heavy applications in node.js
- Create hooks on ANY device that supports JavaScript ( cross-browser support via [socket.io](http://socket.io) )
- Throw any block of sync or async code on a new process with a callback
- Easily scale any tcp based messaging infrastructure ( such as clustering socket.io chat rooms in memory ) 
- Interprocess Message Publishing and Subscribing done through [EventEmitter2](https://github.com/hij1nx/EventEmitter2) and [dnode](http://github.com/SubStack/dnode)
- Messaging API inherits and mimics Node's native EventEmitter API ( with the help of EventEmitter2 )
- Spawning and Daemonizing of processes handled with [Forever](https://github.com/indexzero/forever)
- Easily connect / disconnect hooks "hot" without affecting other services
- Core library currently checking in at about ~450 lines of code

# Available Hooks ( more coming soon )

- [hook.io-helloworld](http://github.com/hookio/helloworld)
- [hook.io-repl](http://github.com/hookio/repl)
- [hook.io-webhook](http://github.com/hookio/webhook)
- [hook.io-cron](http://github.com/hookio/cron)
- [hook.io-request](http://github.com/hookio/request)


<!--

**Core**


**Web**
  
  - [hook.io-irc](http://github.com/marak/hook.io-irc) - Unreleased
  - [hook.io-twitter](http://github.com/marak/hook.io-twitter) - Unreleased
  - [hook.io-webserver](http://github.com/marak/hook.io-webserver) - Unreleased

**Utility**

  - [hook.io-coffeescript](http://github.com/coffeemate/hook.io-coffeescript) - Unreleased
  - [hook.io-levenshtein](https://github.com/AvianFlu/hook.io-levenshtein) - Unreleased
  - [hook.io-logger](http://github.com/marak/hook.io-logger) - a simple hook logger
  - [hook.io-jsdom](http://github.com/tmpvar/hook.io-jsdom) - Unreleased
  
**Humor**

  - [hook.io-insult](http://github.com/marak/hook.io-insult)

-->


# Getting Start / Demo

     npm install hook.io-helloworld -g

Now run:

     hookio-helloworld
     
Spawn up as many as you want. The first one becomes an `output` ( server ), the rest will become `inputs` ( clients ). Each helloworld input will emit a hello on an interval. Now watch the i/o party!     

<!-- 
If you want to start logging all these messages simply install `hookio-logger` with:

    npm install hook.io-logger -g
    
Now run:

    hookio-logger
    
You will now start logging all these messages. 
-->

<!--
## Dual-sided hooks

Both the helloworld and logger hooks act as dual-sided hooks by default. The order you run `hookio-logger` and `hookio-helloworld` does not matter.  They can work as both clients or servers ( inputs or outputs ) and will interface seamlessly using hook.io's default settings.

-->

## Basic Hello World Syntax
http://github.com/hookio/helloworld

``` js
#!/usr/bin/env node

var Helloworld = require('hook.io-helloworld').Helloworld; 

var hello = new Helloworld({
  name: "the-helloworld-hook",
  debug: true
});

hello.start();
 
```

## Basic HTTP post / receive Webhook server
http://github.com/marak/hook.io-webhook

``` js
#! /usr/bin/env node
var Webhook = require('../lib/webhook').Webhook;

var webhookServer = new Webhook({
  name: 'webhook-server',
  port: 9001,
  debug: true
});

webhookServer.on('hook::ready', function(){
  webhookServer.log(this.name, 'http server listening', "9001");
  webhookServer.on('*::request', function(event, data) {
    webhookServer.log(this.name, event, data);
  });
});

webhookServer.start();

```

## Creating custom Hooks

### Super Simple Hook Logger

Try connecting this to your Helloworld Hook. For a multi-transport logger that supports: File, Console, Redis, Mongo, and Loggly, use: [http://github.com/hookio/logger](http://github.com/hookio/logger)

```javascript
#!/usr/bin/env node

var Hook    = require('hook.io').Hook,
    colors  = require('colors');
        
var logger = new Hook({ 
  name: 'the-logger-hook'
});

console.log("Note: You can also just set 'debug' mode to true to get a console logger");

logger.start();

logger.on('*::*', function(event, data){
  console.log('custom log event fired' + event + ' ' + JSON.stringify(data))
});
```

## Screencasts coming soon...

## Tests

Currently all tests require some setup. Eventually they will be compatible with `npat`:

``` bash
  $ cd /path/to/hook.io
  $ npm install forever
  $ [sudo] npm link
  $ cd /path/to/hook.io-helloworld
  $ [sudo] npm link
  $ [sudo] npm link hook.io
  $ cd /path/to/hook.io
  $ [sudo] npm link hook.io-helloworld
  $ vows --spec 
```

## Core Hook.io Team

Marak Squires, Charlie Robbins, Jameson Lee

## Contributors (through code and advice)
Substack, h1jinx, AvianFlu, Chapel, Dominic Tarr, Tim Smart, tmpvar, kadir pekel, perezd