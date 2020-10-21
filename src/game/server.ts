import io from 'socket.io';
import { Logger } from 'winston';
import { getRandomIntInclusive } from '../utils/random';
import {
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  joinRoomFailures,
  joinRoomRequestSchema,
  JoinRoomResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  MAX_ROOM_ID,
  RoomCreatedResponse,
  ROOM_ID_LENGTH,
} from './messages';
import { Room } from './room';
import { validateSocketRequest } from './utils/validateSocketRequest';

export class GameServer {
  private ioServer: io.Server;
  private rooms: { [roomId: string]: Room } = {};
  private logger: Logger;

  private static readonly ROOM_ID_GEN_MAX_TRIES = MAX_ROOM_ID * 2;

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

  closeRoom(room: Room): void {
    this.logger.info('room closed', { roomId: room.id });
    delete this.rooms[room.id];
  }

  private handleCreateRoom(socket: io.Socket): void {
    this.logger.info('received create room request', { socketId: socket.id });
    const roomId = this.generateRoomId(GameServer.ROOM_ID_GEN_MAX_TRIES);
    if (roomId === null) {
      // TODO: handle
      this.logger.error("ran out of room ids, can't create room", {
        socketId: socket.id,
      });
      return;
    }

    const room = new Room(this, roomId, this.logger);
    this.rooms[room.id] = room;
    this.logger.info('created room', { roomId: room.id });
    const player = room.createPlayer(socket);
    if (player === null) {
      this.logger.error(
        'failed to create the first player of a room (this should not happen)',
      );
      delete this.rooms[room.id];
      return;
    }

    const response: RoomCreatedResponse = {
      roomInfo: room.getInfo(),
      playerId: player.id,
    };
    socket.emit(CREATE_ROOM_RESPONSE, response);
  }

  private generateRoomId(maxTries: number): string | null {
    for (let i = 0; i < maxTries; i++) {
      const randomNum = getRandomIntInclusive(1, MAX_ROOM_ID);
      const candidateId = randomNum.toString().padStart(ROOM_ID_LENGTH, '0');
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
