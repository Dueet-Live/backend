import io from 'socket.io';
import { Server } from './server';

export const ioServer = io(process.env.PORT || 3000);
export const server = new Server(ioServer);
