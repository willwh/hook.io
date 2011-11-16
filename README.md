     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a way to enable i/o for your node.js application
    
# v0.8.0pre

## hook.io is a distributed EventEmitter built on node.js

## "hooks" provide a very simple and light way to extend an application to seamlessly communicate with other "hook" enabled devices.

## hook.io applications are usually built by combining together several smaller "hooks" to compose new functionality in a distributed and organized way. 

## In addition to providing this minimalistic i/o framework, hook.io also provides a rich network of hook libraries for managing all sorts of web input and output.

### Installation

     [sudo] npm install hook.io -g
     
### Start a hook

    hookio
    
*auto-discovery will now create a hook server if this is your only running hook*

### Connect another hook

    hookio

*you now have two hooks connected to each other*

This is the most minimal hook.io application you can have. It does nothing. No cruft, no extra baggage.

### Extending your hook.io mesh

that works cross-process / cross-platform / cross-browser. Think of it like a real-time event bus that works anywhere JavaScript is supported.

## You create custom i/o scenarios by picking and choosing from an extensive library of tiny, independent, autonomous "hooks" that seamlessly work together.

### Email List: [http://groups.google.com/group/hookio][0]

### 20 Video lessons available at: [http://youtube.com/maraksquires](http://youtube.com/maraksquires) and [http://github.com/hookio/tutorials](http://github.com/hookio/tutorials)

# Features :

- Build large, decoupled, distributed, and fault tolerant I/O heavy applications in node.js
- Create hooks on ANY device that supports JavaScript (cross-browser support via [socket.io][1])
- Throw any block of sync or async code on a new process with a callback
- Easily scale any tcp based messaging infrastructure (such as clustering socket.io chat rooms in memory) 
- Interprocess Message Publishing and Subscribing done through [EventEmitter2][2] and [dnode][3]
- Messaging API inherits and mimics Node's native EventEmitter API (with the help of EventEmitter2)
- Spawning and Daemonizing of processes handled with [Forever][4]
- Easily connect / disconnect hooks "hot" without affecting other services
- Core library currently checking in at about ~450 lines of code

# Available Hooks (more coming soon)

- [cron](http://github.com/hookio/cron): Adds and removes jobs that emit hook.io events on a schedule
- [couch](http://github.com/hookio/couch): Emit hook.io events based on your CouchDB _changes feed
- [irc](http://github.com/hookio/irc): Full IRC bindings
- [helloworld](http://github.com/hookio/helloworld)
- [logger](http://github.com/hookio/logger): Multi-transport Logger (Console, File, Redis, Mongo, Loggly)
- [mailer](http://github.com/hookio/mailer): Sends emails
- [sitemonitor](http://github.com/hookio/sitemonitor): A low level Hook for monitoring web-sites.
- [request](http://github.com/hookio/request): Simple wrapper for [http://github.com/mikeal/request](http://github.com/mikeal/request)
- [repl](http://github.com/hookio/repl): Rainbow Powered REPL
- [twilio](http://github.com/hookio/twilio): Make calls and send SMS through [Twilio][5]
- [twitter](http://github.com/hookio/twitter): Wrapper to Twitter API
- [webhook](http://github.com/hookio/webhook): Emits received HTTP requests as hook.io events (with optional JSON-RPC 1.0 Support)
- [wget](http://github.com/scottyapp/hook.io-wget): Downloads files using HTTP. Based on the http-get module by Stefan Rusu
 
# Getting Start / Demo

     npm install hook.io-helloworld -g

Now run:

     hookio-helloworld
     
Spawn up as many as you want. The first one becomes a server, the rest will become clients. Each helloworld hook emits a hello on an interval. Now watch the i/o party go!     


# Blog Posts

hook.io for dummies: [http://ejeklint.github.com/2011/09/23/hook.io-for-dummies-part-1-overview/](http://ejeklint.github.com/2011/09/23/hook.io-for-dummies-part-1-overview/)
Distribute Node.js Apps with hook.io: [http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio][6]

## Tests

All tests are written with [vows][7] and require that you link hook.io to itself:

``` bash
  $ cd /path/to/hook.io
  $ [sudo] npm link
  $ [sudo] npm link hook.io
  $ npm test
```

## Core Hook.io Team

Marak Squires, Charlie Robbins, Jameson Lee

## Contributors (through code and advice)
Substack, h1jinx, AvianFlu, Chapel, Dominic Tarr, Tim Smart, tmpvar, kadir pekel, perezd, mklabs, temsa

[0]: http://groups.google.com/group/hookio
[1]: http://socket.io
[2]: https://github.com/hij1nx/EventEmitter2
[3]: http://github.com/SubStack/dnode
[4]: https://github.com/indexzero/forever
[5]: http://www.twilio.com/
[6]: http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio