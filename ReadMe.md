     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a hook input/output framework written in node.js 
    
# v0.4.0

# Current Status :

**Rebuilt entire project for the third time in two years.**

- All hooks are now separated into node.js processes
- Hooks can now have many upstreams ( outgoing client connections ) and many downstreams ( listening servers )
- Interprocess Communication is facilitated through [dnode](http://github.com/SubStack/dnode)
- Spawning and Daemonizing of processes is handled with [Forever](https://github.com/indexzero/forever)
- Message Publishing and Subscribing done through node's native EventEmitter API
- EventEmitter API is extended with namespaces using [EventEmitter2](https://github.com/hij1nx/EventEmitter2)
- Super simple API for insane functionality

**TODO**

 - Create better demos
 - Create basic hooks for: Twitter, IRC, Logging, HTTP servers
 - Improve API for using forever to spawn modules
 - Add ability to dynamically increment and assign ports
 - Refactor [kohai](http://github.com/nodejitsu/kohai) bot to use hook.io
 - Build simple brower-side hook demo
 
# Available Hooks ( more coming soon )

  - [hook.io-repl](http://github.com/marak/hook.io-repl)
  - [hook.io-logger](http://github.com/marak/hook.io-logger)
 
## Try out a contrived demo 

We will create a "battle" ( an i/o hook with a downstream ) that can have several actors ( i/o hooks with upstreams ). These actors will then work together in the battle with hilarious results. This demo begins to showcase the power of an input output hook. More involved demos will be coming shortly. 

## Install hook.io

    git clone git://github.com/Marak/hook.io.git
    cd hook.io
    [sudo] npm install
    
## Start up the battle

    node hooks/battle
    
*Starts up a hook process with a downstream server. Now the battle has started and is waiting for some actors.*


## Connect actors to the battle

    node hooks/scout
    node hooks/gunner
    node hooks/ammo_guy

*Starts up three hook processes with upstream connections to the battle. Each actor is responible for a specific task in the battle.*

## Introduce an enemy to the battle!

    node hooks/enemy
   
*Starts up an enemy hook process which causes a chain reaction of events from other actors causing the enemy to be shot to death.*


## Create a sound effects hook

    node hooks/sfx
   
*Starts up a sound effects hook which listens for messages from all the actors and plays funny sounds effects!*



    
## Contributors ( through code and advice )

AvianFlu, Chapel, Substack, Dominic Tarr, Charlie Robbins, h1jinx, Tim Smart
