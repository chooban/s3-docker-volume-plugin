const winston = require('winston');

winston.emitErrs = true;

let logger = undefined;

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  json: false,
  colorize: false,
  handleExceptions: true,
  humanReadableUnhandledException: true
});

logger = new winston.Logger({
  transports: [consoleTransport],
  exitOnError: false
});

module.exports = logger;
