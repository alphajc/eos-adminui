/**
 * Created by gavin on 3/29/17.
 */
const mongoose = require('mongoose');

const createConnection = config => {
  let userInfo = "";
  let host = config.host || "localhost";
  let port = "";
  let database = "";
  if (config.username || config.password) {
    if (config.username && config.password) {
      userInfo = config.username + ":" + config.password + "@";
    } else {
      throw new Error("用户名与密码没有同时设置。");
    }
  }
  if (config.port) {
    port = ":" + config.port;
  }
  if (config.database) {
    database = "/" + config.database;
  }
  mongoose.Promise = global.Promise;//去警告
  mongoose.connect("mongodb://" + userInfo + host + port + database);

  let db = mongoose.connection;
  process.on("SIGINT", function () {
    db.close(function () {
      console.log("由于程序中断Mongoose断开连接");
      process.exit(0);
    });
  });
  db.on('error', console.error.bind(console, '连接错误：'));
  db.once('open', function () {
    // we're connected!
    console.log("已经连接到mongodb://" + userInfo + host + port + database);
  });

  /**************************添加model**************************/
  db.model("user", {
    name: String,
    dept: String,
    email: String,
    tel: String,
    username: String,
    password: String
  });
  /**************************添加model**************************/

  return db;
};

module.exports = {
  connectDB: createConnection
};