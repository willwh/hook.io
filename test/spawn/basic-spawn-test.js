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
    macros = require('../helpers/macros');

var PORT = 5020;

vows.describe('hook.io/discovery/basic-spawn').addBatch({
  "When a hook is listening on a PORT": macros.assertReady('simple-host', PORT, {
    "and we ask it to be local and begin spawning" : {
      topic : function (hook) {
        var that = this;
        
        hook.local = true;
        hook.spawn('helloworld', this.callback.bind(this, null, hook));
      },
      "it should have spawned children" : function (_, hook) {
        assert.isObject(hook.children);
      },
      "that is called simple" : function (_, hook) {
        assert.isObject(hook.children);
        assert.isObject(hook.children['hook.io-helloworld']);
      },
      "in local mode" : function (_, hook) {
        assert.isTrue(hook.local);
      },
      "without coughing up an error" : function (err, hook) {
        assert.notEqual(typeof err, 'Error');
        assert.isNull(err);
      }
    }
  })
}).export(module);
