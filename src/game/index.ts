import fs from 'fs';
import https from 'https';
import { Server } from './server';

const port = process.env.PORT || 3000;
const key = process.env.KEY || './key.pem';
const cert = process.env.KEY || './cert.pem';

const httpsServer = https.createServer({
  key: fs.readFileSync(key),
  cert: fs.readFileSync(cert),
});
const gameServer = new Server(httpsServer);

gameServer.start(port);
console.log(`Server started on port ${port}`);
