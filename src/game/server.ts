import io from 'socket.io';
import { Logger } from 'winston';
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
import { validateSocketRequest } from './utils/validateSocketRequest';

export class GameServer {
  private ioServer: io.Server;
  private rooms: { [roomId: string]: Room } = {};
  private logger: Logger;

  constructor(ioServer: io.Server, logger: Logger) {
    this.ioServer = ioServer;
    this.logger = logger;

    this.ioServer.on('connect', (socket) => {
      const addr =
        socket.handshake.headers['x-forwarded-for'] ||
        socket.request.connection.remoteAddress;
      const id = socket.id;
      logger.info('new connection', { addr, socketId: id });

      socket.on(CREATE_ROOM_REQUEST, () => this.handleCreateRoom(socket));
      socket.on(JOIN_ROOM_REQUEST, (message: unknown) =>
        this.handleJoinRoom(socket, message),
      );
    });
  }

  private handleCreateRoom(socket: io.Socket): void {
    const roomId = this.generateRoomId();
    if (roomId === null) {
      // TODO: handle
      this.logger.error("ran out of room ids, can't create room", {
        socketId: socket.id,
      });
      return;
    }
    const room = new Room(roomId, this.logger);
    this.rooms[room.id] = room;
    const player = room.createPlayer(socket);
    const response: RoomCreatedResponse = {
      roomInfo: room.getInfo(),
      playerId: player.id,
    };
    socket.emit(CREATE_ROOM_RESPONSE, response);
  }

  private generateRoomId(): string | null {
    for (let i = 1; i <= 999999; i++) {
      const candidateId = i.toString().padStart(6, '0');
      if (!this.rooms[candidateId]) {
        return candidateId;
      }
    }
    return null;
  }

  private handleJoinRoom(socket: io.Socket, message: unknown): void {
    const joinRoomRequest = validateSocketRequest(
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
