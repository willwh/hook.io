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
      instance.on('hook::listening', this.callback.bind(this, null, instance));
      instance.listen({ "hook-port": port });
    },
    "it should fire the `hook::listening` event": function (_, hook, name) {
      assert.equal(name, 'hook::listening');      
    }
  };
  
  return extendContext(context, vows);
};

macros.assertConnect = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('hook::connected', this.callback.bind(null, null, instance));
      instance.connect({ "hook-port": port });
    },
    "should fire the `hook::connected` event": function (_, hook, name) {
      assert.equal(name, 'hook::connected');
    }
  };
  
  return extendContext(context, vows);
};

macros.assertReady = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('hook::ready', this.callback.bind(this, null, instance));
      instance.start({ "hook-port": port });
    },
    "should fire the `hook::ready` event": function (_, hook, name) {
      assert.equal(name, 'hook::ready');
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
};

macros.assertHelloWorld = function (local) {
  return macros.assertSpawn('helloworld', local, {
    "the parent hook": {
      topic: function (host) {
        host.on('*::hello', this.callback.bind(null, null));
      },
      "should emit helloworld": function (_, source, ev, message) {
        assert.equal(source, 'simple-host::hello');
        assert.equal(ev, '*::hello');
        assert.equal(message, 'Hello, I am helloworld-0');
      }
    }
  });
};

macros.assertSpawnExit = function (hooks, vows) {
  var context = {
    topic : function (hook) {
      if (!hook) {
        hook = new Hook();
      }
      
      hook.once('child::exit', this.callback.bind(this, null, hook));
      hook.on('error', function () { });
      hook.spawn(hooks);
    },
    "it should raise the `child:exit` event": function () {
      assert.isTrue(true);
    }
  }  
  
  return extendContext(context, vows);
};

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