/*
 * test-sibling-callresponse.js: Test the ability to start up an output hook that other hooks can connect to
 *                               this output will receive and rebroadcast messages to all its children 
 *                               (which are siblings to each other).
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/siblings/message').addBatch({
  "When a hook is listening on 5050": macros.assertListen('simple-server', 5050, {
    "and another hook connects and emits *.test": macros.assertConnect('simple-client-handler', 5050, {
      topic: function (subscriber) {
        subscriber.on('*.test', this.callback.bind(null, null));
        
        var messager = new Hook({ name: 'simple-client-caller' });
        messager.connect({ port: 5050 });
        messager.on('connected', function () {
          messager.emit('*.test', 'hello there!');
        });
      },
      "the *.test event should be fired correctly": function (_, source, event, data) {
        assert.equal(data, 'hello there!');
      }
    })
  })
}).export(module);