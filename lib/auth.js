/**
 * Created by gavin on 3/28/17.
 */
"use strict";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKED_TIME = 4 * 60 * 60;
let userLockTimes = {};
let userLoginAttempts = {};

const Auth = module.exports = {};

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
 * @require
 *  - req.session
 *  - req.body.username
 *  - req.body.password
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
Auth.authenticate = function authenticate(req, res, next) {
	const params = req.body;
	const username = params.username;

  console.log("auth");
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

	const lockedTime = userLockTimes[username];
	const isLocked = lockedTime && lockedTime > Date.now();

	if (isLocked) {
		let err = new Error("失败次数过多，账户已被冻结！");
		err.status = 401;
		return next(err);
	}

	userLoginAttempts[username] = (userLoginAttempts[username] || 0) + 1;
	req.db.model('user').findOne({"username": username}).exec((error,user) => {
		if (error) {
			let err = new Error("内部服务器错误！（请联系网站管理员）");
			err.status = 501;
			return next(err)
		}

		if (!user) {
		  let err = new Error('该账户不存在！请核对后输入！');
		  err.status = 401;
		  return next(err);
    } else if (params.password === user.password) {
			req.session.authenticated = true;
			req.session.user_id = user._id;
			userLoginAttempts[username] = 0;
			res.json({message: '授权成功！'});
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