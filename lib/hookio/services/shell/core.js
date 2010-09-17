var spawn = require('child_process').spawn,
     fs = require('fs'),
     sys = require('sys'),
     eyes = require('eyes');

exports.start = function() {};


exports.run = function( commands ) {
  
       ommands = commands.toString().split('\n').join(' && ');
       var sh = spawn('sh', [commands]);

       sh.on('exit', function (code, signal) {
         process.exit();
       });

       sh.stdout.on('data', function (out) {
         process.stdout.write(out);
         if (!hasPassword) {
           var stdin = process.openStdin();
           stdin.on('data', function (chunk) {
             sh.stdin.write(chunk);
           });
         }

         hasPassword = true;
       });

       sh.stderr.on('data', function (err) {
         process.stdout.write(err);
       });  

};
