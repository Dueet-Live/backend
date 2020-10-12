import https from 'https';
import io from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  joinRoomFailures,
  joinRoomRequestSchema,
  JoinRoomResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  RoomCreatedResponse,
} from './messages';
import { Room } from './room';
import { validateRequest } from './utils/validation';

export class Server {
  private ioServer: io.Server;
  private httpsServer: https.Server;
  private rooms: { [roomId: string]: Room } = {};

  constructor(httpsServer: https.Server) {
    this.ioServer = io(httpsServer);
    this.httpsServer = httpsServer;

    this.ioServer.on('connect', (socket) => {
      socket.on(CREATE_ROOM_REQUEST, () => this.handleCreateRoom(socket));
      socket.on(JOIN_ROOM_REQUEST, (message: unknown) =>
        this.handleJoinRoom(socket, message),
      );
    });
  }

  start(port: string | number): void {
    this.httpsServer.listen(port);
  }

  private handleCreateRoom(socket: io.Socket): void {
    const room = new Room(uuidv4());
    this.rooms[room.id] = room;
    const player = room.createPlayer(socket);
    const response: RoomCreatedResponse = {
      roomInfo: room.getInfo(),
      playerId: player.id,
    };
    socket.emit(CREATE_ROOM_RESPONSE, response);
  }

  private handleJoinRoom(socket: io.Socket, message: unknown): void {
    const joinRoomRequest = validateRequest(
      joinRoomRequestSchema,
      message,
      socket,
    );
    if (joinRoomRequest === null) {
      return;
    }

    const room = this.rooms[joinRoomRequest.roomId];
    if (!room) {
      const response: JoinRoomResponse = {
        success: false,
        ...joinRoomFailures.noSuchRoom,
      };
      socket.emit(JOIN_ROOM_RESPONSE, response);
      return;
    }

    room.joinRoom(socket);
  }
}
