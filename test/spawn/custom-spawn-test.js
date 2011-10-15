/*
 * custom-spawn-test.js: 
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/spawn/multiple-spawn').addBatch({
  "When implementing something new" : {
    topic: function () {
      var hook = new Hook({ "hook-port": 5030 });
      hook.once('hook::listening', this.callback.bind(null, null, hook));
      hook.listen();
    },
    "hook will be listening" : function (ign, hook, port) { 
      assert.equal(hook['hook-port'], port);
    },
    "and you do some stuff" : {
      topic: function (hook, port) {
        hook.local = true;
        hook.spawn([
          {
            src: '../fixtures/HelloWorld',
            name: 'a',
            port: port
          },
          {
            src: '../fixtures/HelloWorld',
            name: 'b',
            port: port
          }
        ], this.callback.bind(null, null, hook));
      },
      "should be able to kill the children" : function (ign, hook) {
        assert.isTrue(!!hook.children['a']);
        assert.isTrue(!!hook.children['b']);
      }
    }
  }
}).export(module);
