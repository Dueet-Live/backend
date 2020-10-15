import io from 'socket.io';
import {
  choosePartRequestSchema,
  choosePieceRequestSchema,
  CHOOSE_PART_REQUEST,
  CHOOSE_PIECE_REQUEST,
  NOTE_PLAYED,
  readyRequestSchema,
  READY_REQUEST,
} from './messages';
import { Room } from './room';
import { validateSocketRequest } from './utils/validateSocketRequest';

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
  ready: boolean;
  assignedPart?: string;
  room: Room;

  constructor(socket: io.Socket, room: Room, id: number) {
    this.id = id;
    this.socket = socket;
    this.ready = false;
    this.room = room;

    this.socket.on(CHOOSE_PIECE_REQUEST, (message: unknown) =>
      this.handleChoosePiece(message),
    );
    this.socket.on(CHOOSE_PART_REQUEST, (message: unknown) =>
      this.handleChoosePart(message),
    );
    this.socket.on(READY_REQUEST, (message: unknown) => {
      this.handleReady(message);
    });
    this.socket.on(NOTE_PLAYED, (message: unknown) => {
      this.handleNotePlayed(message);
    });
    this.socket.on('disconnect', (reason: string) => {
      this.handleDisconnect(reason);
    });
  }

  send(messageType: string, message: unknown): void {
    this.socket.emit(messageType, message);
  }

  private handleChoosePiece(message: unknown): void {
    const choosePieceRequest = validateSocketRequest(
      choosePieceRequestSchema,
      message,
      this.socket,
    );
    if (choosePieceRequest === null) {
      return;
    }

    this.room.playerDidChoosePiece(choosePieceRequest.id);
  }

  private handleChoosePart(message: unknown): void {
    const choosePartRequest = validateSocketRequest(
      choosePartRequestSchema,
      message,
      this.socket,
    );
    if (choosePartRequest === null) {
      return;
    }

    this.assignedPart = choosePartRequest.id;
    this.room.playerDidChoosePart();
  }

  private handleReady(message: unknown): void {
    const readyRequest = validateSocketRequest(
      readyRequestSchema,
      message,
      this.socket,
    );
    if (readyRequest === null) {
      return;
    }

    if (this.ready === readyRequest.ready) {
      return;
    }
    this.ready = readyRequest.ready;
    // TODO: validation
    this.room.playerDidReady();
  }

  private handleNotePlayed(message: unknown): void {
    // TODO: will validation affect performance?
    this.room.notePlayed(this, message);
  }

  private handleDisconnect(reason: string): void {
    // TODO: need to distinguish between different reasons?
    console.log(reason);
    this.room.playerDidDisconnect(this);
  }

  getInfo(): PlayerInfo {
    return {
      id: this.id,
      assignedPart: this.assignedPart,
      ready: this.ready,
    };
  }
}
