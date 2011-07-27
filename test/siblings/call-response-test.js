/*
 * test-sibling-callresponse.js: Tests the ability to do a call and response to a sibling
 *                               this input will wait for a sibling to send it a message 
 *                               and then respond back.
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/siblings/call-response').addBatch({
  "When a hook is listening on 5001": macros.assertListen('simple-server', 5001, {
    "and another hook attempts to `.connect()`": macros.assertConnect('simple-client-responder', 5001, {
      "and another hook emits *.getSomething": {
        topic: function (responder, _, simpleServer) {
          var subscriber = new Hook({ name: 'simple-client-caller' });
          
          subscriber.connect({ "hook-port": 5001 });
          subscriber.on('*::gotResponse', this.callback.bind(subscriber, null));

          responder.on('*::getSomething', function (source, event, data) {
            responder.emit('gotResponse', 'foobar');
          });
          
          subscriber.on('hook::connected', function () {
            subscriber.emit('getSomething', 'i need a value please');
          });
          
        },
        "the receiving hook should emit *::gotResponse": function (_, value) {
          assert.isTrue(!!~this.event.indexOf('simple-client-responder'));
          assert.isTrue(!!~this.event.indexOf('gotResponse'));
          assert.equal('foobar', value);
        }
      }
    })
  })
}).export(module);