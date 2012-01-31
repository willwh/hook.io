/*
 * transports-test.js: Transport logging tests for the hook.io module
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

vows.describe('hook.io/logging/tranports').addBatch({
  "Given a configuration for logging transports" : {
    topic : function() {
      return {
        port    : 5002,
        logger  : {
          transports : {
            file : { filename : __dirname + "/file.log" }
          }
        }
      };
    },

    "When a hook is initialized" : {
      topic: function(options) {
        var self, hook;

        self  = this;
        hook  = new Hook(options);

        hook.on('hook::ready', function() {
          self.callback(null, this._winston, options.logger.transports);
        });

        hook.start();
      },

      "It should convert the object into Winston transports" : function(err, hookWinston, types) {
        var transports, name, capitalized;

        transports = hookWinston.transports;

        for (name in types) {
          // capitalize the name
          capitalized = name.charAt(0).toUpperCase() + name.substr(1);

          assert.instanceOf(transports[name], winston.transports[capitalized]);
        }
      }
    }
  }
}).export(module);
