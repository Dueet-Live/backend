import io from 'socket.io';
import { ValidationError } from 'yup';
import {
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  UnknownErrorResponse,
  UNKNOWN_ERROR_RESPONSE,
} from '../messages';

export const handleMessageValidationError = (
  error: unknown,
  socket: io.Socket,
): void => {
  if (error instanceof ValidationError) {
    const response: MalformedMessageResponse = { message: error.message };
    socket.emit(MALFORMED_MESSAGE_RESPONSE, response);
    return;
  } else {
    const response: UnknownErrorResponse = {
      error: (error as Error).message,
    };
    socket.emit(UNKNOWN_ERROR_RESPONSE, response);
    return;
  }
};
