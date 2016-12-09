//===================================
require('dotenv').config();
var mysql = require('mysql');
var cors = require('cors');
var jwt = require('./models/jwt');
//===================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

let authToken = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // console.log(token);
  jwt.verify(token)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }, err => {
      return res.status(403).send({
        ok: false,
        msg: 'No token provided.'
      });
    });
}

let hosPool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
  port: process.env.DBPORT
});

let hdcPool = mysql.createPool({
  host: process.env.HDC_HOST,
  user: process.env.HDC_USER,
  password: process.env.HDC_PASSWORD,
  database: process.env.HDC_DB,
  port: process.env.HDC_PORT
});

hosPool.on('connection', (connection) => {
  connection.query('SET NAMES utf8')
});

hdcPool.on('connection', (connection) => {
  connection.query('SET NAMES utf8')
});

app.use((req, res, next) => {
  req.hosPool = hosPool;
  req.hdcPool = hdcPool;
  next();
});

app.use('/users', users);
app.use('/', authToken, index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  // console.log(err);
});

module.exports = app;
