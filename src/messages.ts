import yup from 'yup';
import { RoomInfo } from './room';

// Create room

// eslint-disable-next-line @typescript-eslint/ban-types
export type CreateRoomRequest = {};

export type RoomCreatedResponse = {
  roomId: string;
  playerId: string;
};

// Join room

export const JoinRoomRequestSchema = yup
  .object()
  .shape({
    roomId: yup.string().defined().uuid(),
  })
  .defined();

export type JoinRoomRequest = yup.InferType<typeof JoinRoomRequestSchema>;

export type JoinRoomSuccessResponse = RoomInfo;

export type JoinRoomFailureResponse = {
  code: number;
  message: string;
};

export type JoinRoomResponse =
  | ({ success: true } & JoinRoomSuccessResponse)
  | ({ success: false } & JoinRoomFailureResponse);
