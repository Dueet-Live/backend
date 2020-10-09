import io from 'socket.io';

export type PiecePart = string;

export interface PlayerInfo {
  id: number;
  assignedPart?: string;
  ready: boolean;
}

// Player represents a player in a room
export class Player {
  private socket: io.Socket;

  readonly id: number;
  readonly ready: boolean;
  readonly assignedPart?: string;

  constructor(socket: io.Socket, id: number) {
    this.id = id;
    this.socket = socket;
    this.ready = false;
  }

  getInfo(): PlayerInfo {
    return {
      ...this,
    };
  }
}
