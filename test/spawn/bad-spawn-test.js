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

vows.describe('hook.io/spawn/bad-spawn').addBatch({
  "When a hook has been created, but is not listening": {
    "and we ask it to spawn some children (out of process)": macros.assertSpawnExit('helloworld')
    //
    // TODO: Check edge case for bad spawn in process.
    //
  }
}).export(module);
