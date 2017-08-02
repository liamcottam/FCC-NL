const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const passport = require('passport');
const mongo = require('./mongo');
const api = require('../api');
const compress = require('compression');
const session = require('express-session')

const app = express();
const server = require('http').Server(app);

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress({ threshold: 0 }));
app.use(passport.initialize());
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    return {
      param: param,
      msg: msg
    };
  }
}));
app.use('/api/v1', api);

module.exports = { express: app, server };
