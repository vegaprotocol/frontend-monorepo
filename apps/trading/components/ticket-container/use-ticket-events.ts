import { useEffect } from 'react';

import { useForm } from './use-form';

import { ticketEventEmitter } from '../../lib/ticket-event-emitter';

/**
 * Listen for events from the ticketEventEmitter and update the
 * corresponding field in the form
 */
export const useTicketEvents = () => {
  const form = useForm();

  useEffect(() => {
    ticketEventEmitter.listen((fields) => {
      for (const f in fields) {
        const field = f as keyof typeof fields;
        const value = fields[field];

        if (value) {
          form.setValue(field, value, { shouldValidate: true });
        }
      }
    });

    return () => {
      ticketEventEmitter.unlisten();
    };
  }, [form]);
};
