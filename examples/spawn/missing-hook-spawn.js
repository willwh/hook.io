var hookio = require('../../lib/hookio');

var master = hookio.createHook({ 
  "name": "master-hook", 
  "hooks": [
   { "type" : "twitter" }
  ]
});

master.on('spawn::error', function(err){
  console.log(err)
});

master.listen();
