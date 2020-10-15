import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import https from 'https';
import 'reflect-metadata';
import io from 'socket.io';
import { createConnection } from 'typeorm';
import { GameServer } from './game/server';
import { logger } from './logger/logger';
import { app as resourceServer } from './resources/server';

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
  const port = process.env.PORT || 3000;
  const key = process.env.KEY || './key.pem';
  const cert = process.env.CERT || './cert.pem';

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

  const server = {
    http: httpServer,
    gameServer: new GameServer(io(httpServer), logger),
  };

  server.http.listen(port, () => {
    logger.info('server started', { port });
  });
})();
