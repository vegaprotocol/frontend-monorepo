import type { Validate } from 'react-hook-form';

export const ERROR_EXPIRATION_IN_THE_PAST = 'ERROR_EXPIRATION_IN_THE_PAST';

export const validateExpiration: Validate<string | undefined> = (
  value?: string
) => {
  const now = new Date();
  const valueAsDate = value ? new Date(value) : now;
  if (now > valueAsDate) {
    return ERROR_EXPIRATION_IN_THE_PAST;
  }
  return true;
};
