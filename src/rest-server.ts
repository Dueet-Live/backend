import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import https from 'https';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { logger } from './logger/logger';
import { app } from './resources/app';

(async () => {
  // Load config
  dotenv.config();
  logger.info('loaded environment variables');

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

  let httpServer: https.Server | http.Server;
  if (environment === 'production') {
    httpServer = https.createServer(
      {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
      },
      app,
    );
  } else {
    httpServer = http.createServer(app);
  }

  httpServer.listen(port, () => {
    logger.info('rest server started', { port });
  });
})();
