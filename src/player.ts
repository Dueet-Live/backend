import io from 'socket.io';

export type PiecePart = string;

export interface PlayerInfo {
  playerId: number;
  assignedPart?: string;
  ready: boolean;
}

export class Player {
  socket: io.Socket;

  playerId: number;
  ready: boolean;
  assignedPart?: string;

  constructor(socket: io.Socket, playerId: number) {
    this.socket = socket;

    this.playerId = playerId;
    this.ready = false;
  }

  getInfo(): PlayerInfo {
    return this;
  }
}
