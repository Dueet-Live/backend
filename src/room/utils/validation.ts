import io from 'socket.io';
import { Schema, ValidationError } from 'yup';
import {
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  UnknownErrorResponse,
  UNKNOWN_ERROR_RESPONSE,
} from '../messages';

export const validateRequest = <T>(
  schema: Schema<T>,
  data: unknown,
  socket: io.Socket,
): T | null => {
  try {
    return schema.validateSync(data);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      const response: MalformedMessageResponse = { message: error.message };
      socket.emit(MALFORMED_MESSAGE_RESPONSE, response);
      return null;
    } else {
      const response: UnknownErrorResponse = {
        error: (error as Error).message,
      };
      socket.emit(UNKNOWN_ERROR_RESPONSE, response);
      return null;
    }
  }
};
