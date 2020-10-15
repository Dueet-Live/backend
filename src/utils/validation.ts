import { Schema, ValidationError } from 'yup';

export type ValidationResult<T> =
  | ({ success: true } & { result: T })
  | ({ success: false } & { error: string });

export const validateObject = <T>(
  schema: Schema<T>,
  data: unknown,
): ValidationResult<T> => {
  try {
    return { success: true, result: schema.validateSync(data) };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    } else {
      throw error;
    }
  }
};
