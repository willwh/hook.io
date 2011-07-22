/*
 * test-basic-test.js: Basic tests for the hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    forver = require('forever'),
    macros = require('../helpers/macros');

var PORT = 5021;

vows.describe('hook.io/spawn/basic-forever-spawn').addBatch({  
  "When a hook is listening on a PORT": macros.assertListen('simple-host', PORT, {
    "and we ask it to spawn some children" : {
      topic : function (hook) {
        hook.spawn('helloworld', this.callback.bind(this, null, hook));
      },
      "it should have spawned children" : function (_, hook) {
        assert.isObject(hook.children);
        assert.notEqual(Object.keys(hook.children).length, 0);
      },
      "that is called simple, with a known bin" : function (_, hook) {
        assert.isObject(hook.children);
        assert.isObject(hook.children['hook.io-helloworld']);
        assert.isString(hook.children['hook.io-helloworld'].bin);
      },
      "not in local mode" : function (_, hook) {
        assert.isUndefined(hook.local);
      },
      "without coughing up an error" : function (err, hook) {
        assert.notEqual(typeof err, 'Error');
        assert.isNull(err);
      }
    }
  })
}).export(module);
