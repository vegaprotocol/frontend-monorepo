import {
  type UseFormReturn,
  type Control,
  useFormContext,
} from 'react-hook-form';
import { type FormFields } from './schemas';

export type FormControl = Control<FormFields>;

export const useForm = <T extends FormFields['ticketType']>(_?: T) => {
  const form = useFormContext();

  return form as unknown as UseFormReturn<
    Extract<FormFields, { ticketType: T }>
  >;
};
