#! /usr/bin/env node
var hookio = require('../../lib/hookio'),
    path = require('path');

var public = path.resolve(__dirname, 'public');

var server = hookio.createWebserver({
  name: 'hook.io-webserver',
  webroot: public
});

server.start();

server.on('*::ping', function (data, cb) {
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
