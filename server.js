/**
 * Created by gavin on 3/25/17.
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var server = require('./lib/https-enforcer');

function loadConfig(file) {
	assert.ok(file);

	var _f = fs.readFileSync(file, 'utf8');
	return JSON.parse(_f);
}


var cfgFile = path.join(__dirname, '/etc/config.json');
var cfg = loadConfig(cfgFile);

/**
 * Create HTTP server.
 */
server.createServer(cfg);