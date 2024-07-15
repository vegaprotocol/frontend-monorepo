import { useEffect } from 'react';

import { type FormFields } from './schemas';
import { useForm } from './use-form';

import { ticketEventEmitter } from '../../lib/ticket-event-emitter';

/**
 * Listen for events from the ticketEventEmitter and update the
 * corresponding field in the form
 */
export const useTicketEvents = () => {
  const form = useForm();

  useEffect(() => {
    ticketEventEmitter.on('update', (update: FormFields) => {
      for (const f in update) {
        const field = f as keyof FormFields;
        form.setValue(field, update[field], { shouldValidate: true });
      }
    });

    return () => {
      ticketEventEmitter.off('update');
    };
  }, [form]);
};
