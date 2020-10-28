import * as yup from 'yup';
import { RoomInfo } from './room';

/*************** Create room ***************/

export const CREATE_ROOM_REQUEST = 'createRoomRequest';

// eslint-disable-next-line @typescript-eslint/ban-types
export type CreateRoomRequest = {};

export const CREATE_ROOM_RESPONSE = 'createRoomResponse';
export type RoomCreatedResponse = {
  roomInfo: RoomInfo;
  playerId: number;
};

/********************* Join room *********************/

// Constants
export const MAX_ROOM_ID = 9999;
export const ROOM_ID_LENGTH = MAX_ROOM_ID.toString().length;

// Request
export const JOIN_ROOM_REQUEST = 'joinRoomRequest';

export const joinRoomRequestSchema = yup
  .object()
  .defined()
  .shape({
    roomId: yup.string().defined().length(ROOM_ID_LENGTH),
  });

export type JoinRoomRequest = yup.InferType<typeof joinRoomRequestSchema>;

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
export const choosePieceRequestSchema = yup.object().defined().shape({
  id: yup.number().required(),
});
export type ChoosePieceRequest = yup.InferType<typeof choosePieceRequestSchema>;

/****************** Change speed **********************/

// Request
export const CHANGE_SPEED_REQUEST = 'changeSpeedRequest';
export const changeSpeedRequestSchema = yup.object().defined().shape({
  speed: yup.number().required(),
});
export type ChangeSpeedRequest = yup.InferType<typeof changeSpeedRequestSchema>;

/****************** Choose part **********************/

// Request
export const CHOOSE_PART_REQUEST = 'choosePartRequest';
export const choosePartRequestSchema = yup.object().defined().shape({
  id: yup.string().required(),
});
export type ChoosePartRequest = yup.InferType<typeof choosePartRequestSchema>;

/****************** Ready *****************/

export const READY_REQUEST = 'readyRequest';
export const readyRequestSchema = yup.object().defined().shape({
  ready: yup.boolean().required(),
});
export type ReadyRequest = yup.InferType<typeof readyRequestSchema>;

/****************** Start game *****************/

export const START_GAME_NOTIFICATION = 'startGameNotification';
export type StartGameNotification = {
  inSeconds: number;
};

/****************** Note played *****************/

export const NOTE_PLAYED = 'notePlayed';
export type NotePlayEvent = 'keyup' | 'keydown';
export const notePlayedSchema = yup
  .object()
  .defined()
  .shape({
    note: yup.number().defined(),
    event: yup
      .mixed()
      .defined()
      .oneOf(['keyup', 'keydown'] as const),
  });
export type NotePlayedRequest = yup.InferType<typeof notePlayedSchema>;

/****************** Miscellaneous *****************/

export const MALFORMED_MESSAGE_RESPONSE = 'malformedMessageResponse';
export type MalformedMessageResponse = {
  message: string;
};

export const UNKNOWN_ERROR_RESPONSE = 'unknownErrorResponse';
export type UnknownErrorResponse = {
  error: string;
};
