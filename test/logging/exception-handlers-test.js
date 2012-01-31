/*
 * exception-handlers-test.js: Exception handlers logging tests for the hook.io module
 *
 * MIT LICENCE
 *
 */
'use strict';

var vows, fs, assert, winston, Hook;

fs      = require('fs');
vows    = require('vows');
assert  = require('assert');
winston = require('winston');
Hook    = require('../../lib/hookio').Hook;

vows.describe('hook.io/logging/exception-handlers').addBatch({
  "Given a configuration for logging exception handlers" : {
    topic : function() {
      return {
        port    : 5002,
        logger  : {
          exceptionHandlers : {
            file : { filename : __dirname + "/err.log" }
          },

          handleExceptions : true
        }
      };
    },

    "When a hook is initialized" : {
      topic: function(options) {
        var self, hook;

        self  = this;
        hook  = new Hook(options);

        hook.on('hook::ready', function() {
          self.callback(null, this._winston, options.logger.exceptionHandlers);
        });

        hook.start();
      },

      "It should convert the object into Winston exception handlers" : function(err, hookWinston, types) {
        var exceptionHandlers, name, capitalized;

        exceptionHandlers = hookWinston.exceptionHandlers;

        for (name in types) {
          // capitalize the name
          capitalized = name.charAt(0).toUpperCase() + name.substr(1);

          assert.instanceOf(exceptionHandlers[name], winston.transports[capitalized]);
        }
      }
    }
  }
}).export(module);
