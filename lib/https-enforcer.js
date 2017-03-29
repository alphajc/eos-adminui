/**
 * Created by gavin on 3/25/17.
 */
var express = require('express');
var sprintf = require('util').format;
var debug = require('debug')('eos-adminui:server');
var path = require('path');
var fs = require('fs');

var app = require('./adminui');
var httpApp = express();

exports.createServer = function (config) {
	return new HttpsEnforcer(config);
};

var ROOT = path.join(__dirname, '..');
var DEFAULT_SSL_CERT = path.join(ROOT, 'etc', 'ssl', 'default.pem');

function HttpsEnforcer(config) {
	var port = config.port || 80;
	var sslport = config.sslport || 443;

	var cert, key;
	var ssl = config.ssl;

	if (ssl.certificate && ssl.certificate.length && ssl.key && ssl.key.length) {
		try {
			cert = fs.readFileSync(config.ssl.certificate, 'ascii');
			key = fs.readFileSync(config.ssl.key, 'ascii');
		} catch (e) {
			console.warn('读取证书错误！');
			cert = false;
			key = false;
		}

		/* JSSTYLED */
		var SSL_KEY_RE = /-----BEGIN ((ENCRYPTED|RSA) )?PRIVATE KEY-----[\S\s]+?-----END ((ENCRYPTED|RSA) )?PRIVATE KEY-----/;
		if (!cert || !key || !cert.match('-----BEGIN CERTIFICATE-----') || !key.match(SSL_KEY_RE)) {
			console.warn('Provided key/cert missing BEGIN CERTIFICATE/BEGIN ... PRIVATE KEY BLOCK, using self signed cert');
			selfSignedCerts();
		} else {
			console.info('>>>>>>>>>>使用自定义的SSL证书<<<<<<<<<<');
		}
	} else {
		selfSignedCerts();
	}

	function selfSignedCerts() {
		console.warn('>>>>>>>>>>使用自签名证书<<<<<<<<<<');
		var pem = fs.readFileSync(DEFAULT_SSL_CERT, 'ascii');
		cert = pem;
		key = pem;
	}

	httpApp.set('port', port);
	httpApp.use(function setRedirectHeaders(req, res, next) {
		if (!req.headers || !req.headers['host']) {
			res.send(400);
			return next(false);
		}

		res.header('Location',
			sprintf(
				'https://%s:%s%s',
				req.headers.host.split(':')[0],
				sslport,
				req.url));

		res.sendStatus(302);
		return next(false);
	});

	var httpServer = require('http').createServer(httpApp);
	var server = require('https').createServer({
		key: key,
		cert: cert
	}, app);

	httpServer.on('error', (error) => {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string'
			? '管道' + port
			: '端口' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + '需要超级权限！');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + '已经被使用！');
				process.exit(1);
				break;
			default:
				throw error;
		}
	});

	httpServer.listen(port, () => {
		console.info('在' + port + '端口上监听......');
	});
	server.listen(sslport, () => {
		console.info('在' + sslport + '端口上监听......');
	})
}