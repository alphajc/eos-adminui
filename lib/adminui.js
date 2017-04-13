/**
 * Created by gavin on 3/25/17.
 */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const assert = require('assert-plus');

const db = require('./mongoose');

const app = express();

module.exports = (config) => {

  assert.object(config, "配置文件");
  app.use((req, res, next) => {req.config = config;next()});
  app.use(favicon(path.join(__dirname, '../www', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(session({
    secret: 'lskdkdkekkpqpotpojalwe;lqpwqpwepfjapkDEWWDPFSDaRASDAfSAGsaFdsfSAD',
    secure: true,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 1000}
  }));
  app.use(express.static(path.join(__dirname, '../www')));

  assert.object(config.core, "需要配置正确的core！");
  assert.string(config.core.core_addr, "需要配置正确的core_addr！");
  assert.number(config.core.core_port, "需要配置正确的core_port！");

  config.core.log = require('bunyan').createLogger({
    name: 'adminui',
    level: process.env.LOG || config.logLevel || 'info',
  });
  const eosClient = require('./eos-clients').createClient(config.core);
  const db = require('./mongoose').connectDB(config.mongo);
  app.use(eosClient.handler);
  app.use((req, res, next) => {req.db = db; next()});

  const auth = require('./auth');
  app.route('/api/auth')
    .post(auth.authenticate)
    .delete(auth.signout);

  const multer = require('multer');
  const files = require('./files');
  const upload = multer({dest: config.cache});

  app.get('/api/cryptoes', (req, res, next) => {
    req.client.getCryptoes((err, obj) => {
      if (err) {
        console.error(err);
        err.status = err.statusCode;
        return next(err);
      } else {
        res.send(obj);
      }
    });
  });

  app.route('/api/files')
    .get(auth.requireAuth, files.download)
    .post(auth.requireAuth, upload.any(), files.upload);

  app.get('/api/filelist', auth.requireAuth, files.getList);

// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err = new Error('没有找到该页面');
    err.status = 404;
    next(err);
  });

// error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({message: err.message});
  });

  return app;
};