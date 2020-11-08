import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import https from 'https';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { createLogger } from './logger/logger';
import { createResourceServer } from './resources/app';

(async () => {
  // Create logger
  const logger = createLogger('rest');
  logger.info('loaded environment variables');

  // Load config
  dotenv.config();

  // Connect to database
  try {
    await createConnection();
    logger.info('connected to database');
  } catch (err) {
    logger.error('failed to connect to database', { error: err });
    return;
  }

  // Start server
  const environment = process.env.NODE_ENV || 'development';
  const port = process.env.REST_PORT || 3000;
  const key = process.env.KEY || './key.pem';
  const cert = process.env.CERT || './cert.pem';

  const resourceServer = createResourceServer(logger);
  let httpServer: https.Server | http.Server;
  if (environment === 'production') {
    httpServer = https.createServer(
      {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
      },
      resourceServer,
    );
  } else {
    httpServer = http.createServer(resourceServer);
  }

  httpServer.listen(port, () => {
    logger.info('rest server started', { port });
  });
})();
