/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
const express = require('express');
const logger = require('./util/logger');

const routes = require('./routes');

const app = express();

app.use('/', routes);

app.use((req, res, next) => {
  let err = new Error('Not found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});

module.exports = app;
