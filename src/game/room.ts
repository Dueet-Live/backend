import io from 'socket.io';
import { Logger } from 'winston';
import { getRandomIntInclusive } from '../utils/random';
import {
  joinRoomFailures,
  JoinRoomResponse,
  JOIN_ROOM_RESPONSE,
  NOTE_PLAYED,
  ROOM_INFO_UPDATED_NOTIFICATION,
  StartGameNotification,
  START_GAME_NOTIFICATION,
} from './messages';
import { Player, PlayerInfo } from './player';
import { GameServer } from './server';

export type RoomInfo = {
  id: string;
  piece?: number;
  players: PlayerInfo[];
};

export class Room {
  readonly id: string;
  piece?: number;
  players: { [id: number]: Player } = {};
  private server: GameServer;
  private get allPlayers(): Player[] {
    return Object.values(this.players);
  }
  private logger: Logger;

  private static readonly PLAYER_ID_LOWER_BOUND = 0;
  private static readonly PLAYER_ID_UPPER_BOUND = 9;
  private static readonly MAX_NUM_PLAYERS = 2;

  constructor(server: GameServer, id: string, logger: Logger) {
    this.id = id;
    this.server = server;
    this.logger = logger.child({ roomId: id });
  }

  createPlayer(socket: io.Socket): Player {
    this.logger.info('create room', { socketId: socket.id });
    const playerId = this.generateNextPlayerId();
    const player = new Player(socket, this, playerId, this.logger);
    this.players[playerId] = player;
    return player;
  }

  joinRoom(socket: io.Socket): void {
    this.logger.info('join room', { socketId: socket.id });

    // If room is full, reject request
    if (this.allPlayers.length >= Room.MAX_NUM_PLAYERS) {
      const joinRoomResponse: JoinRoomResponse = {
        success: false,
        ...joinRoomFailures.roomFull,
      };
      socket.emit(JOIN_ROOM_RESPONSE, joinRoomResponse);
      return;
    }

    // Create the player and send response
    const player = this.createPlayer(socket);
    const info = this.getInfo();
    // Send a response to the joining player
    const joinRoomResponse: JoinRoomResponse = {
      success: true,
      playerId: player.id,
      roomInfo: info,
    };
    socket.emit(JOIN_ROOM_RESPONSE, joinRoomResponse);
    // Also notify the existing players
    this.broadcastInfoUpdate(player.id);
  }

  playerDidChoosePiece(piece: number): void {
    // TODO: validation
    this.piece = piece;
    this.broadcastInfoUpdate();
  }

  playerDidChoosePart(): void {
    // TODO: validation
    this.broadcastInfoUpdate();
  }

  playerDidReady(): void {
    // TODO: validation
    this.broadcastInfoUpdate();

    // If all players are ready, start game
    if (this.allPlayers.every((player) => player.ready)) {
      this.logger.info('all ready');
      const startMessage: StartGameNotification = { inSeconds: 3 };
      this.allPlayers.forEach((player) =>
        player.send(START_GAME_NOTIFICATION, startMessage),
      );
    }
  }

  playerDidDisconnect(player: Player): void {
    delete this.players[player.id];
    if (this.allPlayers.length === 0) {
      // Last player, close room
      this.server.closeRoom(this);
    } else {
      // There are other players, broadcast the info to them
      this.broadcastInfoUpdate();
    }
  }

  notePlayed(playingPlayer: Player, message: unknown): void {
    this.allPlayers.forEach((player) => {
      if (player.id !== playingPlayer.id) {
        player.send(NOTE_PLAYED, message);
      }
    });
  }

  private broadcastInfoUpdate(...except: number[]): void {
    const info = this.getInfo();
    this.logger.info('broadcast info update', { except, info });
    this.allPlayers.forEach((player) => {
      if (!except.includes(player.id)) {
        player.send(ROOM_INFO_UPDATED_NOTIFICATION, info);
      }
    });
  }

  private generateNextPlayerId(): number {
    while (true) {
      const newId = getRandomIntInclusive(
        Room.PLAYER_ID_LOWER_BOUND,
        Room.PLAYER_ID_UPPER_BOUND,
      );
      if (!this.players[newId]) {
        return newId;
      }
    }
  }

  getInfo(): RoomInfo {
    return {
      id: this.id,
      players: this.allPlayers.map((p) => p.getInfo()),
      piece: this.piece,
    };
  }
}
