/*
 * hookio.js: the web hook platform.
 *
 * (C) 2010 Marak Squires
 * MIT LICENSE
 *
 */

require.paths.unshift(__dirname);

var hookio = exports;

hookio.version = '0.2.0';
hookio.start     = require('hookio/core').start;
hookio.services  = require('hookio/services');
hookio.Hooks      = require('hookio/models/Hook').Hooks;
