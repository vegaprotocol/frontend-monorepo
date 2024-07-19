import { type UseFormReturn, useFormContext } from 'react-hook-form';
import { type FormFields } from './schemas';

export const useForm = <T extends FormFields['ticketType']>(_?: T) => {
  const form = useFormContext();

  return form as unknown as UseFormReturn<
    Extract<FormFields, { ticketType: T }>
  >;
};
