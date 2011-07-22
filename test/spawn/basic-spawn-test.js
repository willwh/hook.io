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
      topic : function (host) {
        host.local = true;
        host.spawn('simple', this.callback.bind(this));
        //host.spawn(['simple'], this.callback.bind(this));
        //host.spawn(['simple', 'troll'], this.callback.bind(this));
      },
      "it should have spawned children" : function (_, host) {
        assert.isObject(host.children);
      },
      "that is called simple" : function (_, host) {
        assert.isObject(host.children);
        assert.isObject(host.children['hook.io-' +'simple']);
      },
      "in local mode" : function (_, host) {
        assert.isTrue(host.local);
      },
      "without coughing up an error" : function (err, host) {
        assert.notEqual(typeof err, 'Error');
        assert.isNull(err);
      }
    }
  }),
}).addBatch({

}).export(module);
