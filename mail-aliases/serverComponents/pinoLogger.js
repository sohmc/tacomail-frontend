const pino = require('pino');

export const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV == 'development' ? 'debug' : 'info'),
  browser: { asObject: true },
});
