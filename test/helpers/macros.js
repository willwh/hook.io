/*
 * macros.js: Test macros hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    eyes = require('eyes'),
    Hook = require('../../lib/hookio').Hook;

var macros = exports;

macros.assertListen = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('listening', this.callback.bind(this, null, instance));
      instance.listen({ port: port });
    },
    "it should fire the `listening` event": function (_, hook, name) {
      assert.equal(name, 'listening');      
    }
  };
  
  return extendContext(context, vows);
};

macros.assertConnect = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('connected', this.callback.bind(null, null, instance));
      instance.connect({ port: port });
    },
    "should fire the `connected` event": function (_, hook, name) {
      assert.equal(name, 'connected');
    }
  };
  
  return extendContext(context, vows);
};

macros.assertReady = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('ready', this.callback.bind(this, null, instance));
      instance.start({ port: port });        
    },
    "should fire the `ready` event": function (_, hook, name) {
      assert.equal(name, 'ready');
    }
  };
  
  return extendContext(context, vows);
};

macros.assertSpawn = function (hooks, local, vows) {
  if (!vows && typeof local === 'object') {
    vows = local;
    local = false;
  }
  
  var context = {
    topic : function (hook) {
      var that = this;
      hook.local = local;
      hook.spawn(hooks, this.callback.bind(this, null, hook));
    },
    "it should have spawned children" : function (_, hook) {
      assert.isObject(hook.children);
    },
    "that is called simple" : function (_, hook) {
      assert.isObject(hook.children);
      assert.isObject(hook.children['helloworld']);
    },
    "without coughing up an error" : function (err, hook) {
      assert.notEqual(typeof err, 'Error');
      assert.isNull(err);
    }
  }
  
  if (local) {
    context["in local mode"] = function (_, hook) {
      assert.isTrue(hook.local);
    };
  }
  else {
    context["not in local mode"] = function (_, hook) {
      assert.isFalse(!!hook.local);
    };
  }
  
  return extendContext(context, vows);
}

function extendContext (context, vows) {
  if (vows) {
    if (vows.topic) {
      console.log('Cannot include topic at top-level of nested vows:');
      eyes.inspect(vows, 'vows');
      process.exit(1);
    }
    
    Object.keys(vows).forEach(function (key) {
      context[key] = vows[key];
    });
  }
  
  return context;
}