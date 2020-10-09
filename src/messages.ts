import * as yup from 'yup';
import { RoomInfo } from './room';

/*************** Create room ***************/
export const CREATE_ROOM_REQUEST = 'createRoomRequest';

// eslint-disable-next-line @typescript-eslint/ban-types
export type CreateRoomRequest = {};

export const CREATE_ROOM_RESPONSE = 'createRoomResponse';
export type RoomCreatedResponse = {
  roomId: string;
  playerId: number;
};

/********************* Join room ****************/
export const JOIN_ROOM_REQUEST = 'joinRoomRequest';

export const JoinRoomRequestSchema = yup.object().defined().shape({
  roomId: yup.string().defined().uuid(),
});

export type JoinRoomRequest = yup.InferType<typeof JoinRoomRequestSchema>;

export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
export type JoinRoomSuccessResponse = {
  playerId: number;
  roomInfo: RoomInfo;
};
export const joinRoomFailures = {
  noSuchRoom: {
    code: 100,
    message: 'no such room',
  },
  roomFull: {
    code: 101,
    message: 'room full',
  },
};
export type JoinRoomFailureResponse = {
  code: number;
  message: string;
};
export type JoinRoomResponse =
  | ({ success: true } & JoinRoomSuccessResponse)
  | ({ success: false } & JoinRoomFailureResponse);

/****************** Miscellaneous *****************/
export const MALFORMED_MESSAGE_RESPONSE = 'malformedMessageResponse';
export type MalformedMessageResponse = {
  message: string;
};

export const UNKNOWN_MESSAGE_RESPONSE = 'unknownMessageResponse';
export type UnknownErrorResponse = {
  error: string;
};
