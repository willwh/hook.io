
     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a full featured i/o framework for node.js
    
# v0.6.0

## hook.io creates a distributed node.js EventEmitter that works cross-process / cross-platform / cross-browser. Think of it like a real-time event bus that works anywhere JavaScript is supported.

## You create custom i/o scenarios by picking and choosing from an extensive library of tiny, independent, autonomous "hooks" that seamlessly work together.

### Email List: [http://groups.google.com/group/hookio](http://groups.google.com/group/hookio)

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

- [cron](http://github.com/hookio/cron): Execute Hook Events as Tasks
- [irc](http://github.com/hookio/irc): Full IRC bindings
- [helloworld](http://github.com/hookio/helloworld)
- [logger](http://github.com/hookio/logger): Multi-transport Logger ( Console, File, Redis, Mongo, Loggly )
- [mailer](http://github.com/hookio/mailer): Sends emails
- [pinger](http://github.com/hookio/pinger): Pings URLS on intervals ( useful for monitoring )
- [request](http://github.com/hookio/request): Simple wrapper for [http://github.com/mikeal/request](http://github.com/mikeal/request)
- [repl](http://github.com/hookio/repl): Rainbow Powered REPL
- [twilio](http://github.com/hookio/twilio): Make calls and send SMS through [Twilio][10]
- [twitter](http://github.com/hookio/twitter): Wrapper to Twitter API
- [webhook](http://github.com/hookio/webhook): Emits received HTTP requests as Events ( with optional JSON-RPC 1.0 Support )

# Getting Start / Demo

     npm install hook.io-helloworld -g

Now run:

     hookio-helloworld
     
Spawn up as many as you want. The first one becomes a server, the rest will become clients. Each helloworld hook emits a hello on an interval. Now watch the i/o party go!     


# Blog Posts

[http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio](http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio)

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