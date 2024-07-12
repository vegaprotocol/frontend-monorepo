import { EventEmitter } from 'eventemitter3';
import { useEffect } from 'react';

import { type FormFields } from '../../components/ticket-container/schemas';
import { useForm } from '../../components/ticket-container/use-form';

export const ticketEventEmitter = new EventEmitter();

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
