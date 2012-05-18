var union = require('union'),
    ecstatic = require('ecstatic'),
    basicAuth = require('./middleware/basic-auth'),
    middlewares = [],
    io = require('socket.io-client'),
    Stream = require('stream'),
    util = require('util'),
    path = require('path');

exports.createServer = function createServer(options) {
  options = options || {};

  if (typeof options.basicAuth == 'object') {
    middlewares.push(basicAuth(
      options.basicAuth.username || 'admin',
      options.basicAuth.password || 'admin'
    ));
  }

  middlewares.push(ecstatic(
    path.join(__dirname, '..', 'browser', 'build'), {
    autoIndex: false,
    handleErrors: false
  }));

  if (typeof options.webroot == 'string') {
    middlewares.push(ecstatic(options.webroot));
  }

  return union.createServer({
    before: middlewares
  });
};

exports.createConnection = function createConnection(port, host, cb) {
  if (!cb && typeof host == 'function') {
    cb = host;
    host = 'localhost';
  }

  if (!port) {
    var err = new Error('createConnection requires a port argument!');
    if (cb) {
      return cb(err);
    }
    else {
      throw err;
    }
  }

  var url = util.format('http://%s:%d', host, port),
      sock = io.connect(url),
      stream = new Stream();

  console.log(url);

  stream.writable = true;
  stream.readable = true;

  stream.write = function (buffer) {
    sock.emit('message', String(buffer));
  };

  stream.destroy = stream.end = function () {
    sock.disconnect();
    stream.emit('end');
  };

  sock.on('message', function (message) {
    stream.emit('data', message);
  });

  sock.on('connect', function () {
    stream.emit('connect');
    if (cb) {
      cb(null);
    }
  });

  return stream;
};

