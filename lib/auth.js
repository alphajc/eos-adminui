/**
 * Created by gavin on 3/28/17.
 */
var util = require('util');

var AUTH_TOKEN_HEADER = 'x-adminui-token';
var ACCOUNT_LOCKED_MESSAGE = '失败地尝试次数过多，账户将暂时被冻结';
var MAX_LOGIN_ATTEMPTS = 5;
var LOCKED_TIME = 4 * 60 * 60;
var userLockTimes = {};
var userLoginAttempts = {};

var MANTA_ENALBED = require('../etc/config.json')['manta'] || false;
var Auth = module.exports = {};

Auth.optionalAuth = function optionalAuth(req, res, next) {};

Auth.requireAuth = function requireAuth(req, res, next) {};

Auth.getAuth = function getAuth(req, res, next) {};

/**
 * 认证
 *
 * @requires
 * - req.sessions
 *
 * @param username {String} username
 * @param password {String} password
 */
Auth.authenticate = function authenticate(req, res, next) {
	var params = req.body;
	var username = params.username;

	if (typeof (username) === 'undefined') {
		let err = new Error("需要输入用户名！");
		err.status = 409;
		return next(err);
	}

	if (typeof (params.password) === 'undefined') {
		let err = new Error("需要输入用户密码！");
		err.status = 409;
		return next(err);
	}

	if (typeof (req.sessions) === 'undefined') {
		let err = new Error("服务器会话无法访问！（请联系网站管理员）");
		err.status = 503;
		return next(err);
	}

};

Auth.signout = function signout(req, res, next) {
	req.sessions.destroy();
	return next();
};