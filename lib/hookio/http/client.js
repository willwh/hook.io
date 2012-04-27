var Hook          = require('../hook').Hook,
    util          = require('util'),
    createSocket  = require('./client-stream');

var Client = exports.Client = function (options) {
  options = options || {};
  Hook.call(this, options);
};

Client.prototype.start = function (host) {
  this.stream = createSocket(host);
  Hook.prototype.start.apply(this, [].slice.call(arguments, 1));
}

util.inherits(Client, Hook);
