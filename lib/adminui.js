/**
 * Created by gavin on 3/25/17.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.use(favicon(path.join(__dirname, '../www', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	secret: 'lskdkdkekkpqpotpojalwe;lqpwqpwepfjapkDEWWDPFSDaRASDAfSAGsaFdsfSAD',
	secure: true,
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60 * 1000}
}));
app.use(express.static(path.join(__dirname, '../www')));

// app.use('/', index);
// app.use('/users', users);
var auth = require('./auth');
app.post('/auth', auth.authenticate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('没有找到该页面');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.json({status:err.status, message:err.message});
});

module.exports = app;