/*
 * macros.js: Test macros hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    Hook = require('../../lib/hookio').Hook;

var macros = exports;

macros.assertListen = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.listen({ port: port });
      instance.on('listening', this.callback.bind(this, null, instance));
    }
  };
  
  return extendContext(context, vows || {
    "it should fire the `listening` event": function (_, hook, name) {
      assert.equal(name, 'listening');      
    }
  });
};

macros.assertConnect = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('connected', this.callback.bind(this, null, instance));
      instance.connect({ port: port });
    }
  }
  
  return extendContext(context, vows || {
    "should fire the `connected` event": function (_, hook, name) {
      assert.equal(name, 'connected');
    }
  });
};

macros.assertReady = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('ready', this.callback.bind(this, null, instance));
      instance.start({ port: port });        
    }
  };
  
  return extendContext(context, vows || {
    "should fire the `ready` event": function (_, hook, name) {
      assert.equal(name, 'ready');
    }
  });
};

function extendContext (context, vows) {
  if (vows) {
    Object.keys(vows).forEach(function (key) {
      context[key] = vows[key];
    })
  }
  
  return context;
}