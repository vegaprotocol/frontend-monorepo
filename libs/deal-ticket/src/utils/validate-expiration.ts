import type { Validate } from 'react-hook-form';

export const validateExpiration: (
  errorMessage: string
) => Validate<string | undefined, object> =
  (errorMessage: string) => (value?: string) => {
    const now = new Date();
    const valueAsDate = value ? new Date(value) : now;
    if (now > valueAsDate) {
      return errorMessage;
    }
    return true;
  };
