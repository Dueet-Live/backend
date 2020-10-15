import appRoot from 'app-root-path';
import winston, { format, transports } from 'winston';

// https://github.com/winstonjs/winston/issues/1537
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
        format.colorize(),
        format.timestamp(),
        format.prettyPrint(),
        format.printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
        ),
      ),
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});
