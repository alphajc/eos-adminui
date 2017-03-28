/**
 * Created by gavin on 3/25/17.
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert-plus');
var util = require('util');

var restify = require('restify');

var EventEmitter = require('events').EventEmitter;
var HttpsEnforcer = require('./https-enforcer');

var Sessions = require('./sessions');
var TraceEvent = require('./trace-event');

var mime = require('mime');

mime.define({
	'application/font-woff': ['woff']
});

var settings = require('./settings');

function resume(req, res, next) {
	process.nextTick(function () {
		req.resume();
	});
	next();
}

var bodyParser = restify.bodyParser({mapParams: false});

var ROOT = path.join(__dirname, '..');
var DEFAULT_SSL_CERT = path.join(ROOT, 'etc', 'ssl', 'default.pem');

var ADMINUI = function (options) {
	EventEmitter.call(this);

	assert.object(options.config, 'options.config');
	assert.object(options.log, 'options.log');

	this.root = ROOT;
	this.config = options.config;
	this.log = options.log;

	this.httpsEnforcer = HttpsEnforcer.createServer({
		sslport: this.config.sslport,
		port: this.config.port,
		log: this.log
	});

	this.server = this.createServer();
};

util.inherits(ADMINUI, EventEmitter);

ADMINUI.prototype.createServer = function () {
	var config = this.config;
	var log = this.log;

	var cert, key;
	var ssl = config.ssl;

	if (ssl.certificate && ssl.certificate.length && ssl.key && ssl.key.length) {
		try {
			cert = fs.readFileSync(config.ssl.certificate, 'ascii');
			key = fs.readFileSync(config.ssl.key, 'ascii');
		} catch (e) {
			log.warn('读取证书错误！');
			cert = false;
			key = false;
		}

		/* JSSTYLED */
		var SSL_KEY_RE = /-----BEGIN ((ENCRYPTED|RSA) )?PRIVATE KEY-----[\S\s]+?-----END ((ENCRYPTED|RSA) )?PRIVATE KEY-----/;
		if (!cert || !key || !cert.match('-----BEGIN CERTIFICATE-----') || !key.match(SSL_KEY_RE)) {
			log.warn('Provided key/cert missing BEGIN CERTIFICATE/BEGIN ... PRIVATE KEY BLOCK, using self signed cert');
			selfSignedCerts();
		} else {
			log.info('使用自定义的SSL证书');
		}
	} else {
		selfSignedCerts();
	}

	function selfSignedCerts() {
		log.warn('使用自签名证书');
		var pem = fs.readFileSync(DEFAULT_SSL_CERT, 'ascii');
		cert = pem;
		key = pem;
	}

	var server = restify.createServer({
		name: 'adminui',
		log: log,
		certificate: cert,
		key: key
	});

	server.root = this.root;
	server.pre(restify.pre.pause());
	server.pre(restify.pre.sanitizePath());
	server.use(restify.requestLogger());
	server.use(restify.queryParser());
	server.use(restify.gzipResponse());
	server.use(restify.acceptParser(server.acceptable));

	TraceEvent.mount({
		skipRoutes: ['ping', 'getca'],
		server: server
	});

	if (config.simulateLatency) {
		server.use(require('./fake-latency').simulateLatency());
	}

	// Mounts the EOS clients to req.eos
	config.log = log;
	// var eosClients = require('./eos-clients').createClients(config);
	var self = this;

	// server.use(eosClients.handler);

	server.use((function attachOtherClients(req, res, next) {
		req.adminUuid = config.adminUuid;
		// req.sessions = this.sessions;
		req.config = config;

		return next();
	}).bind(this));


	var auth = require('./auth');
	server.get('/api/auth', auth.requireAuth, auth.getAuth);
	server.post({name: 'authenticate', path: '/api/auth'},
		resume,
		bodyParser,
		auth.authenticate);


	server.del('/api/auth', auth.signout);

	// server.get({name: 'ping', path: '/api/ping'}, auth.optionalAuth, setUfds, function ping(req, res, next) {
	// 	if (req.session) {
	// 		req.sessions.touch(req.session.token);
	// 	}
	//
	// 	res.send({
	// 		services: {
	// 			moray: req.eos[req.dc].moray.connected,
	// 			ufds: req.ufds.connected
	// 		},
	// 		time: new Date()
	// 	});
	//
	// 	return next(false);
	// });

	/* Static Files */
	// var assets = require('./assets');

	// server.get({
	// 	name: 'index',
	// 	path: '/'
	// }, function indexPage(req, res, next) {
	// 	res.setHeader('Access-Control-Allow-Origin', '*');
	// 	next();
	// }, assets.index(this));

	// server.get('/app.css', assets.less(this));
	// server.get('/app.js', assets.preFile(this), restify.conditionalRequest(), assets.file(this));
	// server.get('/libs.js', assets.preFile(this), restify.conditionalRequest(), assets.file(this));

	// server.get({
	// 		name: 'asset',
	// 		path: /^\/(font|img|css|js|favicon\.ico).*$/
	// 	},
	// 	assets.preFile(this),
	// 	restify.conditionalRequest(),
	// 	assets.file(this));

	// server.get({
	// 	name: 'catchall',
	// 	path: /\/(?!api)\w+/
	// }, function catchAll(req, res, next) {
	// 	res.setHeader('Access-Control-Allow-Origin', '*');
	// 	next();
	// }, assets.index(this));

	// var auditLogger = require('./audit');
	// server.on('after', function _filteredAuditLog(req, res, route, err) {
	// 	if (req.path() === '/ping') {
	// 		return;
	// 	}
	// 	var method = req.method;
	// 	var body =
	// 		!(method === 'POST' && route.name === 'authenticate') &&
	// 		!(method === 'GET' && Math.floor(res.statusCode/100) === 2);
	// 	auditLogger({
	// 		log: req.log.child({ component: 'audit', route: route && route.name }, true),
	// 		body: body
	// 	})(req, res, route, err);
	// });

	server.on('uncaughtException', function (req, res, route, error) {
		req.log.fatal({
			err: error,
			url: req.url,
			route: route,
			params: req.params
		});

		res.send(error);
	});


	return server;
};


ADMINUI.prototype.listen = function (callback) {
	var adminui = this;

	this.httpsEnforcer.listen(this.config.port, this.config.host, function () {
		adminui.log.info('HTTP服务器在%s:%s上监听',
			adminui.httpsEnforcer.address().address,
			adminui.httpsEnforcer.address().port);
	});

	this.server.listen(this.config.sslport, this.config.host, function () {
		adminui.log.info('HTTPS服务器在%s:%s上监听',
			adminui.server.address().address,
			adminui.server.address().port);
	});

	if (typeof (callback) === 'function') {
		callback(this);
	}
};

module.exports = {
	ADMINUI: ADMINUI,
	createServer: function (options) {
		return new ADMINUI(options);
	}
};