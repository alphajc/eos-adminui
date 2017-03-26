/**
 * Created by gavin on 3/25/17.
 */
var ADMINUI_BUCKET = 'adminui';
var ADMINUI_BUCKET_CFG = {
	index: {
		key: { type: 'string', unique: false },
		value: { type: 'string', unique: false }
	},
	pre: []
};
var async = require('async');
var _ = require('underscore');

function createSettingsBucket(client) {
	function onBucketReady() {
		client.log.info('adminui bucket OK');

		client.getObject(ADMINUI_BUCKET, 'settings', function (err) {
			if (err && err.name === 'ObjectNotFoundError') {
				client.putObject(ADMINUI_BUCKET, 'settings', {}, function (putErr, obj) {
					if (putErr) {
						client.log.info('error adding settings key');
					} else {
						client.log.info('added key: settings');
					}
				});
			}

			if (err) {
				client.log.info(err, 'error adding settings key');
			}

			client.log.info('settings key OK');
		});
	}

	client.log.info('Checking moray for adminui bucket');
	client.getBucket(ADMINUI_BUCKET, function (getErr) {
		if (getErr) {
			if (getErr.name === 'BucketNotFoundError') {
				client.log.info('adminui moray bucket not found, creating...');
				client.createBucket(ADMINUI_BUCKET, ADMINUI_BUCKET_CFG, function (createErr) {
					if (createErr) {
						client.log.fatal(createErr, 'error creating settings bucket: %s', createErr.message);
						return null;
					}
					onBucketReady();
					return null;
				});
				return null;
			}
			client.log.fatal(getErr, 'error retrieving settings bucket from moray');
		} else {
			onBucketReady();
		}
		return null;
	});
}



module.exports = {
	createSettingsBucket: createSettingsBucket,
	/**
	 * available settings
	 *
	 * provision.preset_networks
	 * provision.preset_primary_network
	 * ssl_key
	 * ssl_certificate
	 */
	getSettings: function (req, res, next) {
		var sapi = req.eos[req.dc].sapi;
		var log = req.log;
		var getSSLFromSapi = function (cb) {
			sapi.listServices({name:'adminui'}, function (listServicesErr, services) {
				var adminui = services[0];
				log.debug(adminui, 'found service');
				sapi.getService(adminui.uuid, function (getServiceErr, svs) {
					var metadata = svs.metadata;
					if (metadata.ssl_key && metadata.ssl_certificate) {
						cb(null, {
							ssl_certificate: metadata.ssl_certificate,
							ssl_key: metadata.ssl_key
						});
					} else {
						cb(null, {});
					}
				});
			});
		};

		var getSettingsFromMorday = function (cb) {
			req.eos[req.dc].moray.getObject(ADMINUI_BUCKET,
				'settings',
				{noCache: true },
				function (err, obj) {
					if (err) {
						cb(err);
					}
					cb(null, obj.value);
				});
		};

		async.parallel([getSettingsFromMorday, getSSLFromSapi], function (err, results) {
			var obj = {};
			results.forEach(function (r) {
				_.extend(obj, r);
			});
			if (obj.ssl_key) {
				obj.ssl_key = true;
			}
			res.send(obj);
			return next();
		});
	},
	saveSettings: function (req, res, next) {
		var log = req.log;
		var body = req.body;
		var tasks = [];

		tasks.push(function updateSslCert(cb) {
			if (body.ssl_certificate && body.ssl_key && body.ssl_certificate.length && body.ssl_key.length) {
				var ssl_certificate = body.ssl_certificate;
				var ssl_key = body.ssl_key;
				req.log.info('looking for adminui sapi service');
				sapi.listServices({name:'adminui'}, function (listServicesErr, services) {
					var adminui = services[0];
					log.info(adminui, 'found service');
					sapi.updateService(adminui.uuid, {
						metadata: {
							ssl_certificate: ssl_certificate,
							ssl_key: ssl_key
						}
					}, function (err, done) {
						if (err) {
							log.fatal(err, 'error updating sapi service');
							cb(err);
						} else {
							cb(null, true);
						}
					});
				});
			} else {
				cb(null, true);
			}
		});

		tasks.push(function updateSettings(cb) {
			var networks = body['provision.preset_networks'];
			if (networks) {
				moray.putObject(ADMINUI_BUCKET, 'settings', {
					'provision.preset_networks': networks
				}, function (err, obj) {
					if (err) {
						log.error('error saving settings', err);
						cb(err);
					}
					cb(null, true);
				});
			} else {
				cb(null, true);
			}
		});

		async.parallel(tasks, function (err, results) {
			if (err) {
				log.fatal('error updating settings', err);
				return next(err);
			} else {
				res.send({});
				return next();
			}
		});
	}
};