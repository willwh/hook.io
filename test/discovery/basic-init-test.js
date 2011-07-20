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

vows.describe('hook.io/discovery/basic-init').addBatch({
  "When a Hook is listening on 5010": macros.assertListen('simple-listen', 5010, {
    "and another hook attempts to `.connect()`": macros.assertConnect('simple-connect', 5010),
    "and another hook attempts to `.start()`": macros.assertReady('simple-start', 5010)
  })
}).export(module);