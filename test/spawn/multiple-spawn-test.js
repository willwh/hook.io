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

vows.describe('hook.io/spawn/multiple-spawn').addBatch({
}).export(module);

//
// Remark: This is not currently possible in hook.io, 
// but it should be!!
//
// var hook = new hookio.Hook();
// 
// hook.listen();
// 
// hook.on('hook::listening', function () {
//   hook.spawn([
//     {
//       type: 'webserver',
//       name: 'webserver-0'
//       options: { "hook-port": 9001 }
//     },
//     {
//       type: 'webserver',
//       name: 'webserver-1'
//       options: { "hook-port": 9002 }
//     }
//   ])
// });