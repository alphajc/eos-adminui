/**
 * Created by gavin on 3/25/17.
 */
var path = require('path');
var assert = require('assert');
var fs = require('fs');
var restify = require('restify');


function loadConfig(file) {
	assert.ok(file);

	var _f = fs.readFileSync(file, 'utf8');
	return JSON.parse(_f);
}


var cfgFile = path.join(__dirname, '/etc/config.json');
var cfg = loadConfig(cfgFile);

var log = require('bunyan').createLogger({
	name: 'adminui',
	level: process.env.LOG || cfg.logLevel || 'info',
	serializers: restify.bunyan.serializers
});


log.info('初始化AdminUI');
var adminui = require('./lib/adminui').createServer({
	config: cfg,
	log: log,
	version: require('./package.json').version
});

adminui.listen(function ready() {
	log.info('开始监听!');
});

process.on('uncaughtException', function preventOtherError(e) {
	log.fatal(e, '未捕获的异常');
});