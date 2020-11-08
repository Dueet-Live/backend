import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import https from 'https';
import 'reflect-metadata';
import io from 'socket.io';
import { GameServer } from './game/server';
import { logger } from './logger/logger';

(async () => {
  // Load config
  dotenv.config();
  logger.info('loaded environment variables');

  // Start server
  const environment = process.env.NODE_ENV || 'development';
  const port = process.env.WS_PORT || 3000;
  const key = process.env.KEY || './key.pem';
  const cert = process.env.CERT || './cert.pem';

  let httpServer: https.Server | http.Server;
  if (environment === 'production') {
    httpServer = https.createServer({
      key: fs.readFileSync(key),
      cert: fs.readFileSync(cert),
    });
  } else {
    httpServer = http.createServer();
  }

  const server = {
    http: httpServer,
    gameServer: new GameServer(io(httpServer), logger),
  };

  server.http.listen(port, () => {
    logger.info('ws server started', { port });
  });
})();
