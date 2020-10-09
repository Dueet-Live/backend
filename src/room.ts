import { Player, PlayerInfo } from './player';

export interface RoomInfo {
  roomId: string;
  piece?: string;
  players: PlayerInfo[];
}

export class Room {
  roomId: string;
  piece?: string;
  players: Player[] = [];

  constructor(id: string) {
    this.roomId = id;
  }

  getInfo(): RoomInfo {
    return this;
  }
}
