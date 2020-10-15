import io from 'socket.io';
import { Schema } from 'yup';
import { validateObject } from '../../utils/validation';
import {
  MalformedMessageResponse,
  MALFORMED_MESSAGE_RESPONSE,
  UnknownErrorResponse,
  UNKNOWN_ERROR_RESPONSE,
} from '../messages';

export const validateSocketRequest = <T>(
  schema: Schema<T>,
  data: unknown,
  socket: io.Socket,
): T | null => {
  try {
    const validationResult = validateObject(schema, data);
    if (validationResult.success) {
      return validationResult.result;
    }
    const response: MalformedMessageResponse = {
      message: validationResult.error,
    };
    socket.emit(MALFORMED_MESSAGE_RESPONSE, response);
    return null;
  } catch (err) {
    const response: UnknownErrorResponse = {
      error: err.message,
    };
    socket.emit(UNKNOWN_ERROR_RESPONSE, response);
    return null;
  }
};
