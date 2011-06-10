     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    the node.js hook i/o platform

# v0.4.0

# Current Status :

Rebuilt entire project for the third time in two years.

- All hooks are now separated into node.js processes
- Interprocess Communication is facilitated through dnode
- Spawning and Daemonizing of processes is handled with Forever
- Message publishing has a one-one API with EventEmitter class 
- Message Publishing and Subscribing done through node's native EventEmitter API
- EventEmitter API is extended with namespaces using EventEmitter2
- Hooks can now have many upstreams and many downstreams
- Super simple API for insane functionality