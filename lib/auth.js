/**
 * Created by gavin on 3/28/17.
 */

var MAX_LOGIN_ATTEMPTS = 5;
var LOCKED_TIME = 4 * 60 * 60;
var userLockTimes = {};
var userLoginAttempts = {};

var Auth = module.exports = {};

Auth.optionalAuth = function optionalAuth(req, res, next) {};

//需要权限的操作应包含此中间件
Auth.requireAuth = function requireAuth(req, res, next) {
	if (req.session.authenticated) {
		console.log("已获取认证！");
		next();
	} else {
		let err = new Error("未授权！");
		err.status = 403;
		return next(err);
	}
};

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

	if (typeof (req.session) === 'undefined') {
		let err = new Error("服务器会话无法访问！（请联系网站管理员）");
		err.status = 503;
		return next(err);
	}

	var lockedTime = userLockTimes[username];
	var isLocked = lockedTime && lockedTime > Date.now();

	if (isLocked) {
		let err = new Error("失败次数过多，账户已被冻结！");
		err.status = 401;
		return next(err);
	}

	userLoginAttempts[username] = (userLoginAttempts[username] || 0) + 1;
	req.db.model('user').findOne({"username": username}).exec((errors,users) => {
		if (errors) {
			let err = new Error("内部服务器错误！（请联系网站管理员）");
			err.status = 501;
			return next(err)
		}
		if (params.password === users.password) {
			req.session.authenticated = true;
			userLoginAttempts[username] = 0;
			res.send('授权成功！');
			delete userLockTimes[username];
			delete userLoginAttempts[username];
		} else {
			let err = new Error("认证失败！再出错" + (MAX_LOGIN_ATTEMPTS - userLoginAttempts[username]) + "次后将锁定该帐号！");
			if (userLoginAttempts[username] >= MAX_LOGIN_ATTEMPTS) {
				err.message = "失败次数过多，账户已被冻结！";
				userLockTimes[username] = Date.now() + LOCKED_TIME;
				userLoginAttempts[username] = 0;
			}
			err.status = 401;
			return next(err);
		}
	});
};

Auth.signout = function signout(req, res, next) {
	req.sessions.destroy();
	return next();
};