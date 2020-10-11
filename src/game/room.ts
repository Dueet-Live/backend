import io from 'socket.io';
import {
  NOTE_PLAYED,
  ROOM_INFO_UPDATED_NOTIFICATION,
  StartGameNotification,
  START_GAME_NOTIFICATION,
} from './messages';
import { Player, PlayerInfo } from './player';
import { getRandomIntInclusive } from './utils/random';

export type RoomInfo = {
  id: string;
  piece?: string;
  players: PlayerInfo[];
};

export class Room {
  readonly id: string;
  piece?: string;
  players: { [id: number]: Player } = {};
  private get allPlayers(): Player[] {
    return Object.values(this.players);
  }

  private static readonly PLAYER_ID_LOWER_BOUND = 0;
  private static readonly PLAYER_ID_UPPER_BOUND = 9;

  constructor(id: string) {
    this.id = id;
  }

  createPlayer(socket: io.Socket): Player {
    const playerId = this.generateNextPlayerId();
    const player = new Player(socket, this, playerId);
    this.players[playerId] = player;
    return player;
  }

  playerDidChoosePiece(piece: string): void {
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
      const startMessage: StartGameNotification = { inSeconds: 3 };
      this.allPlayers.forEach((player) =>
        player.send(START_GAME_NOTIFICATION, startMessage),
      );
    }
  }

  playerDidDisconnect(player: Player): void {
    delete this.players[player.id];
    this.broadcastInfoUpdate();
  }

  notePlayed(playingPlayer: Player, message: unknown): void {
    this.allPlayers.forEach((player) => {
      if (player.id !== playingPlayer.id) {
        player.send(NOTE_PLAYED, message);
      }
    });
  }

  private broadcastInfoUpdate(): void {
    const info = this.getInfo();
    this.allPlayers.forEach((player) =>
      player.send(ROOM_INFO_UPDATED_NOTIFICATION, info),
    );
  }

  private generateNextPlayerId(): number {
    // TODO: handle too many players
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
