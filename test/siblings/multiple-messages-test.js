/*
 * multiple-messages-test.js: Test the ability to work with multiple hook and rather important message passing
 *                            to demonstrate some heavier network usage.
 *
 *                            This test suite init and start a server hook with a predefined number 
 *                            of clients.
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros'),
    EventEmitter = require('events').EventEmitter;

// create a local macro
// TODO: see if it's better to put this in helpers/macros

var fixture = fs.readFileSync(path.join(__dirname, '../../browser/hook.js')).toString();

var macro = function(event, port){
  
  var context = {
    topic: function(subscriber, data) {
      var messager = new Hook({ name: 'simple-client-messager' });

      subscriber.once('*::' + event, function(data) {
        subscriber.emit('response.' + event, data);
      });

      messager.once('*::response.' + event, this.callback.bind(subscriber, null));

      messager.connect({ 'hook-port': port });
      messager.once('hook::connected', function () {
        messager.emit(event, fixture);
      });
    }
  };

  context["the *::" + event + " should be fired correctly"] = function(data) {
    assert.equal(data, fixture);
  };

  return context;
};


vows.describe('hook.io/siblings/multiple-message').addBatch({
  "When a hook is listening on 5050": macros.assertListen('simple-server', 5002, {
    "and another hook connects to emit *::test": macro('test', 5002),
    "and another hook connects to emit *::test::one": macro('test::one', 5002),
    "and another hook connects to emit *::test::two": macro('test::two', 5002),
    "and another hook connects to emit *::test::three": macro('test::three', 5002),
    "and another hook connects to emit *::test::four": macro('test::four', 5002),
    "and another hook connects to emit *::test::five": macro('test::five', 5002),
    "and another hook connects to emit *::test::six": macro('test::six', 5002)
  })
}).export(module);


/*
vows.describe('hook.io/siblings/message').addBatch({
  "When a hook is listening on 5050": macros.assertListen('simple-server', 5002, {
    "and another hook connects": macros.assertConnect('simple-subscriber', 5002, {
      "and emits *::test": {
        topic: function (subscriber) {
          var messager = new Hook({ name: 'simple-client-messager' });

          subscriber.on('*::test', this.callback.bind(subscriber, null, subscriber));

          messager.connect({ "hook-port": 5002 });
          messager.once('hook::connected', function () {
            messager.emit('test', fixture);
          });

        },

        "the *::test event should be fired correctly": {
          topic: function(subscriber, data) {
            var messager = new Hook({ name: 'simple-client-messager' });

            subscriber.on('*::test1', this.callback.bind(subscriber, null));

            messager.connect({ "hook-port": 5002 });
            messager.once('hook::connected', function() {
              messager.emit('test1', fixture);
            });
          },

          "data should be valid buddy": function(data) {
            assert.equal(data, fixture);
          }
        },


        "the *::test2 event should be fired correctly": {
          topic: function(subscriber, data) {
            var messager = new Hook({ name: 'simple-client-messager' });

            subscriber.on('*::test2', this.callback.bind(subscriber, null));

            messager.connect({ "hook-port": 5002 });
            messager.once('hook::connected', function() {
              messager.emit('test2', fixture);
            });
          },

          "data should be valid buddy guy": function(data) {
            assert.equal(data, fixture);
          }
        }
      }
    })
  })
}).export(module);
*/
