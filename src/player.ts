import io from 'socket.io';
import {
  ChoosePartRequest,
  ChoosePartRequestSchema,
  ChoosePieceRequest,
  ChoosePieceRequestSchema,
  CHOOSE_PART_REQUEST,
  CHOOSE_PIECE_REQUEST,
} from './messages';
import { Room } from './room';
import { handleMessageValidationError } from './utils/error';

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
  private ready: boolean;
  private assignedPart?: string;
  private room: Room;

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
  }

  send(messageType: string, message: unknown): void {
    this.socket.emit(messageType, message);
  }

  private handleChoosePiece(message: unknown): void {
    let choosePieceRequest: ChoosePieceRequest;
    try {
      choosePieceRequest = ChoosePieceRequestSchema.validateSync(message);
    } catch (error: unknown) {
      return handleMessageValidationError(error, this.socket);
    }

    this.room.choosePiece(choosePieceRequest.name);
  }

  private handleChoosePart(message: unknown): void {
    let choosePartRequest: ChoosePartRequest;
    try {
      choosePartRequest = ChoosePartRequestSchema.validateSync(message);
    } catch (error: unknown) {
      return handleMessageValidationError(error, this.socket);
    }

    this.assignedPart = choosePartRequest.name;
    this.room.didChoosePart();
  }

  getInfo(): PlayerInfo {
    return {
      ...this,
      assignedPart: this.assignedPart,
    };
  }
}
