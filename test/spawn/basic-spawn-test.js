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

vows.describe('hook.io/spawn/basic-spawn').addBatch({
  "When a hook is listening on a 5020": macros.assertReady('simple-host', 5020, {
    "and we ask it to be local and begin spawning": macros.assertSpawn('helloworld', true)
  }),
  "When a hook is listening on a 5021": macros.assertListen('simple-host', 5021, {
    "and we ask it to spawn some children" : macros.assertSpawn('helloworld')
  })
}).export(module);
