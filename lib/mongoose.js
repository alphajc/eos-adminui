/**
 * Created by gavin on 3/29/17.
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	dept: String,
	email: String,
	tel: String,
	username: String,
	password: String
});

mongoose.establishConnection = config => {
	let userInfo = "";
	let host = config.host || "localhost";
	let port = "";
	let database = "";
	if (config.username || config.password) {
		if (config.username && config.password) {
			userInfo = config.username + ":" + config.password + "@";
		} else {
			callback(new Error("用户名与密码没有同时设置。"));
		}
	}
	if (config.port) {
		port = ":" + config.port;
	}
	if (config.database) {
		database = "/" + config.database;
	}
	mongoose.connect("mongodb://" + userInfo + host + port + database);

	process.on("SIGINT", function () {
		mongoose.connection.close(function () {
			console.log("由于程序中断Mongoose断开连接");
			process.exit(0);
		});
	});

};

module.exports = {
	connectMongoDB: config => mongoose.establishConnection(config)
};