const winston = require('winston');
const { combine, colorize } = winston.format;

const winstonLogLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV == 'development' ? 'debug' : 'info');
console.log('LOG_LEVEL: ' + winstonLogLevel);
console.log('NODE_ENV:  ' + process.env.NODE_ENV);

export const logger = winston.createLogger({
  level: winstonLogLevel,
  format: combine(
    colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});
