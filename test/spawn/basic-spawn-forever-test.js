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
      topic : function (host) {
        host.spawn('simple', this.callback.bind(this));
        //host.spawn(['simple'], this.callback.bind(this));
        //host.spawn(['simple', 'troll'], this.callback.bind(this));
      },
      "it should have spawned children" : function (_, host) {
        assert.isObject(host.children);
        assert.notEqual(Object.keys(host.children).length, 0);
      },
      "that is called simple, with a known bin" : function (_, host) {
        assert.isObject(host.children);
        assert.isObject(host.children['hook.io-' +'simple']);
        assert.isString(host.children['hook.io-' +'simple'].bin);
      },
      "not in local mode" : function (_, host) {
        assert.isUndefined(host.local);
      },
      "without coughing up an error" : function (err, host) {
        assert.notEqual(typeof err, 'Error');
        assert.isNull(err);
      }
    }
  }),
}).addBatch({

}).export(module);
