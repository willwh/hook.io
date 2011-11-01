/*
 * config.js: Module responsible for config actions.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var nconf  = require('nconf'),
    path = require('path'),
    hookio = require('../hookio');

config = exports.config =  function (options) {
  var self = this;

  //
  // Each hook get's their own config.json file managed
  // by an instance of the `nconf.Provider`.
  //
  // Remark: This configuration path needs to load from a
  // default configuration file and then write to a custom
  // configuration file based on the hook `type/name` combo.
  //
  this.config = new nconf.Provider();
  this.config.argv = true;

  function useFileStore () {
    if (path.existsSync('./config.json')) {
      self.config.use('file', { file: './config.json' });
    }
  }
  
  if (options.redis) {
    //
    // Remark: try / catch is a hack for doing optional npm deps
    //
    //
    try {
      require('nconf-redis');
      this.config.use('redis', options.redis);
    } catch(ex) {
      console.error("(node) warning: Missing nconf-redis module");
      useFileStore();
    }
  } else {
    useFileStore();
  }

  this.config.load();

  //
  // Create a shortcut to this.config so we can iterate over it.
  //
  var config = this.config;

  //
  // Iterate over all the nconf stores and copy key values to Hook.
  //
  config._stores.forEach(function (_, i) {
    var s = config._stores[i];
    Object.keys(config[s].store).forEach(function (o) {
      //
      // Remark: I currently assume that the order in which property overwrites
      // occur doesn't matter.
      //
      self[o] = config[s].store[o];
    });
  });

  //
  // Iterate over options and copy key values,
  // to Hook ( overwriting duplicate keys from argv and config )
  //
  Object.keys(options).forEach(function (o) {
    self[o] = options[o];
  });

  //
  // Remark: This is a hack for passing arrays of objects as strings,
  // through argv...fix this in optimist
  //
  if (typeof this.transports === 'string') {
    try {
      this.transports = JSON.parse(this.transports);
    } catch (err) {
     console.log('warn: bad transport parse', err.message);
    }
  }

}
