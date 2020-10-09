import io from 'socket.io';
import { ROOM_INFO_UPDATED_NOTIFICATION } from './messages';
import { Player, PlayerInfo } from './player';
import { getRandomIntInclusive } from './utils/random';

export type RoomInfo = {
  id: string;
  piece?: string;
  players: PlayerInfo[];
};

export class Room {
  readonly id: string;
  private piece?: string;
  private players: { [id: number]: Player } = {};

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

  choosePiece(piece: string): void {
    // TODO: validation
    this.piece = piece;
    this.broadcastInfoUpdate();
  }

  didChoosePart(): void {
    this.broadcastInfoUpdate();
  }

  private broadcastInfoUpdate(): void {
    const info = this.getInfo();
    Object.values(this.players).forEach((player) =>
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
      ...this,
      players: Object.values(this.players).map((p) => p.getInfo()),
    };
  }
}
