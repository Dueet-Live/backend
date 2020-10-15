import { Response } from 'express';
import { Schema } from 'yup';
import { validateObject } from '../../utils/validation';

export const validateHttpRequest = <T>(
  schema: Schema<T>,
  data: unknown,
  res: Response,
): T | null => {
  const validationResult = validateObject(schema, data);
  if (validationResult.success) {
    return validationResult.result;
  }
  res.status(400).json({ error: validationResult.error });
  return null;
};
