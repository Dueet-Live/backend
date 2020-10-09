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

/********************* Join room *********************/

// Request
export const JOIN_ROOM_REQUEST = 'joinRoomRequest';

export const JoinRoomRequestSchema = yup.object().defined().shape({
  roomId: yup.string().defined().uuid(),
});

export type JoinRoomRequest = yup.InferType<typeof JoinRoomRequestSchema>;

// Response
export const JOIN_ROOM_RESPONSE = 'joinRoomResponse';
// Success
export type JoinRoomSuccessResponse = {
  playerId: number;
  roomInfo: RoomInfo;
};
// Failure
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
// Union
export type JoinRoomResponse =
  | ({ success: true } & JoinRoomSuccessResponse)
  | ({ success: false } & JoinRoomFailureResponse);

/****************** Room info updated **********************/

export const ROOM_INFO_UPDATED_NOTIFICATION = 'roomInfoUpdatedNotification';

/****************** Choose piece **********************/

// Request
export const CHOOSE_PIECE_REQUEST = 'choosePieceRequest';
export const ChoosePieceRequestSchema = yup.object().defined().shape({
  name: yup.string().required(),
});
export type ChoosePieceRequest = yup.InferType<typeof ChoosePieceRequestSchema>;

/****************** Choose part **********************/

// Request
export const CHOOSE_PART_REQUEST = 'choosePartRequest';
export const ChoosePartRequestSchema = yup.object().defined().shape({
  name: yup.string().required(),
});
export type ChoosePartRequest = yup.InferType<typeof ChoosePartRequestSchema>;

/****************** Miscellaneous *****************/

export const MALFORMED_MESSAGE_RESPONSE = 'malformedMessageResponse';
export type MalformedMessageResponse = {
  message: string;
};

export const UNKNOWN_ERROR_RESPONSE = 'unknownErrorResponse';
export type UnknownErrorResponse = {
  error: string;
};
