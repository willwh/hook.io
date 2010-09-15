/*
 * scheduler.js: the web hook platform.
 *
 * (C) 2010 Marak Squires
 * MIT LICENSE
 *
 */

require.paths.unshift(__dirname);

var scheduler = exports;

scheduler.version = '0.1.0';
scheduler.start     = require('scheduler/core').start;
