import appRoot from 'app-root-path';
import winston, { format, transports } from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.prettyPrint(),
        format.simple(),
      ),
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});
