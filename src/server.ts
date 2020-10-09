import io from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  CREATE_ROOM_REQUEST,
  CREATE_ROOM_RESPONSE,
  joinRoomFailures,
  JoinRoomRequest,
  JoinRoomRequestSchema,
  JoinRoomResponse,
  JOIN_ROOM_REQUEST,
  JOIN_ROOM_RESPONSE,
  RoomCreatedResponse,
} from './messages';
import { Room } from './room';
import { handleMessageValidationError } from './utils/error';

export class Server {
  private ioServer: io.Server;
  private rooms: { [roomId: string]: Room } = {};

  constructor(ioServer: io.Server) {
    this.ioServer = ioServer;

    this.ioServer.on('connect', (socket) => {
      socket.on(CREATE_ROOM_REQUEST, () => this.handleCreateRoom(socket));
      socket.on(JOIN_ROOM_REQUEST, (message: unknown) =>
        this.handleJoinRoom(socket, message),
      );
    });
  }

  private handleCreateRoom(socket: io.Socket): void {
    const room = new Room(uuidv4());
    this.rooms[room.id] = room;
    const player = room.createPlayer(socket);
    const response: RoomCreatedResponse = {
      roomId: room.id,
      playerId: player.id,
    };
    socket.emit(CREATE_ROOM_RESPONSE, response);
  }

  private handleJoinRoom(socket: io.Socket, message: unknown): void {
    let joinRoomRequest: JoinRoomRequest;
    try {
      joinRoomRequest = JoinRoomRequestSchema.validateSync(message);
    } catch (error: unknown) {
      return handleMessageValidationError(error, socket);
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

    const player = room.createPlayer(socket);
    const joinRoomResponse: JoinRoomResponse = {
      success: true,
      playerId: player.id,
      roomInfo: room.getInfo(),
    };
    socket.emit(JOIN_ROOM_RESPONSE, joinRoomResponse);
  }
}
