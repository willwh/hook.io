#! /usr/bin/env node
var hookio = require('../../lib/hookio'),
    path = require('path');

var public = path.resolve(__dirname, 'public');

var server = hookio.createHook({
  name: 'hook.io-webserver',
  webroot: public
});

server.listen();

server.on('*::ping', function (data, cb) {
  console.log('ping');
  var place = function () {

    var item = places.shift();
    places.push(item);

    return item;
  }

  cb(null, place());
})

setInterval(function() {
  server.emit('pong')
  }
, 10000);

var places = [
  "world",
  "computer",
  "hook.io"
];

server.on('**', function () {
  console.log(this.event);
});
