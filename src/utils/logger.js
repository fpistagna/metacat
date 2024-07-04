const winston = require('winston');

const levels = {
  error: 0,
  warn: 1,
  http: 2,
  info: 3,
  debug: 4,
  verbose: 5,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
}

winston.addColors(colors)

const level = () => {
/*  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'*/
  const env = process.env.NODE_ENV || 'development'
  switch(env) {
  case "development":
    return 'debug'
  case "verbose":
    return 'verbose'
  case "production":
    return 'info'
  default:
    return 'info'
  }
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
]

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

module.exports = logger