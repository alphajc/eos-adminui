/**
 * Created by gavin on 3/25/17.
 */

var TraceEvent = require('trace-event');

module.exports = {
	mount: function (options) {
		var server = options.server;
		var skipRoutes = options.skipRoutes || [];

		server.use(function (req, res, next) {
			req.trace = TraceEvent.createBunyanTracer({ log: req.log });
			if (req.route && !skipRoutes.indexOf(req.route.name || req.route.path) === -1) {
				req.trace.begin(req.route.name);
			}
			next();
		});

		server.on('after', function (req, res, route, err) {
			if (route && skipRoutes.indexOf[route.name] === -1) {
				req.trace.end(route.name);
			}
		});
	}
};