/**
 * Created by gavin on 3/25/17.
 */
var restify = require('restify');
var sprintf = require('util').format;

module.exports = {};

module.exports.createServer = function (config) {
	return new HttpsEnforcer(config);
};

function HttpsEnforcer(config) {
	var sslport = config.sslport;
	var server = restify.createServer({log: config.log});

	server.use(function setRedirectHeaders(req, res, next) {
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

		res.send(302);
		return next(false);
	});

	server.get(new RegExp('.*'), function (req, res, next) {
		res.redirect(sprintf('https://%s%s}', req.headers.host, req.headers.url));
		return next(false);
	});

	return server;
}