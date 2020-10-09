import io from 'socket.io';
import { Server } from './server';

export const ioServer = io(3000);
export const server = new Server(ioServer);
