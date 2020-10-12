import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import io from 'socket.io';
import { Server } from './server';

const { error } = dotenv.config();
if (error) {
  throw error;
}

const environment = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const key = process.env.KEY || './key.pem';
const cert = process.env.CERT || './cert.pem';

if (environment === 'production') {
  const httpsServer = https.createServer({
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
  });
  const ioServer = io(httpsServer);
  const gameServer = new Server(ioServer);
  httpsServer.listen(port);
} else {
  const ioServer = io(port);
  const gameServer = new Server(ioServer);
}

console.log(`Server started on port ${port}`);
