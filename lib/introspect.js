var introspect = exports;

var fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    colors = require('colors'),
    path = require('path');

introspect.files = ['config.json', 'LICENSE', 'package.json', 'ReadMe.md', 'bin/scaffold', 'lib/scaffold.js'];

introspect.generate = function (hookName, callback) {
  introspect.hookName = hookName;
  async.map(introspect.files, copyFiles, function(err, results){
    if (err) {
      return console.log(err);
    }
    console.log('Hook scaffold for ' + hookName.cyan  + ' generated in '
      + './'.grey + hookName.grey + '!!');
    if(callback) {
      callback();
    }
  });
};


function copyFiles (file, callback) {

  var src = __dirname + '/scaffold/',
      dst = './' + introspect.hookName + '/'; //eg., ./hookName
  
  fs.readFile(src + file, function(err, result){
    if (err) {
      return console.log(err);
    }
    //
    // TODO: scan for word scaffold and replace
    //
    var filePath = path.normalize(dst + file);
    // Replace the `scaffold` file name with the new hook name
    //
    
    filePath = filePath.replace('lib/scaffold.js', 'lib/' + introspect.hookName + '.js');
    filePath = filePath.replace('bin/scaffold', 'bin/' + introspect.hookName);

    //
    // Replace any instances of the string 'scaffold' or 'Scaffold',
    // with new hook name
    //

    result = result.toString().replace(/scaffold/g, introspect.hookName);

    var className = introspect.hookName.substr(0, 1).toUpperCase() + introspect.hookName.substr(1, introspect.hookName.length);
    
    result = result.toString().replace(/Scaffold/g, className);
    
    (function(filePath) {
        mkdirp(path.dirname(filePath), 0755, function(err){
          if(err){
            console.log(err);
            callback(err);
          }
          fs.writeFile(filePath, result, function(err, result){
            callback(err, result);
          });
        });
    })(filePath);
  });
}
