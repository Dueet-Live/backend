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

  private closeRoomTimeoutId: NodeJS.Timeout | null = null;
  private static readonly CLOSE_ROOM_TIMEOUT_MILLISECONDS = 30 * 60 * 1000; // 30 minutes

  private static readonly PLAYER_ID_LOWER_BOUND = 0;
  private static readonly PLAYER_ID_UPPER_BOUND = 9;
  private static readonly MAX_NUM_PLAYERS = 2;
  private static readonly PLAYER_ID_GEN_MAX_TRIES = 20;

  constructor(server: GameServer, id: string, logger: Logger) {
    this.id = id;
    this.server = server;
    this.logger = logger.child({ roomId: id });
  }

  createPlayer(socket: io.Socket): Player | null {
    const playerId = this.generateNextPlayerId(Room.PLAYER_ID_GEN_MAX_TRIES);
    if (playerId === null) {
      this.logger.error("ran out of player ids, can't create player", {
        socketId: socket.id,
      });
      return null;
    }
    const player = new Player(socket, this, playerId, this.logger);
    this.players[playerId] = player;
    this.logger.info('created player', {
      socketId: socket.id,
      playerId: player.id,
    });
    return player;
  }

  joinRoom(socket: io.Socket): void {
    this.logger.info('join room', { socketId: socket.id });

    // Cancel the timeout to close the room
    if (this.closeRoomTimeoutId !== null) {
      this.logger.info('room closure cancelled');
      clearTimeout(this.closeRoomTimeoutId);
      this.closeRoomTimeoutId = null;
    }

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
    if (player === null) {
      // Should not happen, because we have already checked whether the room is full
      this.logger.error('ran out of player id (this should not happen)', {
        socketId: socket.id,
      });
      return;
    }

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
      // Last player, set a timeout to close the room if no players join in time
      this.logger.info('last player left, room closure scheduled', {
        closeRoomTimeout: Room.CLOSE_ROOM_TIMEOUT_MILLISECONDS,
      });
      this.closeRoomTimeoutId = setTimeout(
        () => this.server.closeRoom(this),
        Room.CLOSE_ROOM_TIMEOUT_MILLISECONDS,
      );
    } else {
      // There are other players
      // First, make the rest not ready
      this.logger.info('player left, mark the other player(s) not ready');
      this.allPlayers.forEach((player) => (player.ready = false));
      // Then, broadcast the update
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

  private generateNextPlayerId(maxTries: number): number | null {
    for (let i = 0; i < maxTries; i++) {
      const newId = getRandomIntInclusive(
        Room.PLAYER_ID_LOWER_BOUND,
        Room.PLAYER_ID_UPPER_BOUND,
      );
      if (!this.players[newId]) {
        return newId;
      }
    }
    return null;
  }

  getInfo(): RoomInfo {
    return {
      id: this.id,
      players: this.allPlayers.map((p) => p.getInfo()),
      piece: this.piece,
    };
  }
}
