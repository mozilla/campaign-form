'use strict';

const express = require('express');
const session = require('express-session');
const path = require('path');

const { SESSION_SECRET } = process.env;

if (!SESSION_SECRET) {
  console.error('SESSION_SECRET is not set!');
  process.exit(1);
}

const index = require('./routes/index');

const app = express();

if (app.get('env') === 'production') {
  // Redirect to HTTPS if called with HTTP
  app.use((req, res, next) => {
    const xForwardedProtoHeader = req.headers['x-forwarded-proto'];
    if (xForwardedProtoHeader != 'https') {
      res.redirect(`https://${req.headers.host}${req.originalUrl}`);
      return;
    }

    next();
  });
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionOptions.cookie = {
    secure: true,
  }
}

app.use(session(sessionOptions));

app.use('/', index);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
