/*
 * shell.js - for running system commands
 *
 * (C) 2010 Marak Squires
 * MIT LICENSE
 *
 */

require.paths.unshift(__dirname);

var shell = exports;

shell.version   = '0.1.0';
shell.start     = require('shell/core').start;
shell.run       = require('shell/core').run;
