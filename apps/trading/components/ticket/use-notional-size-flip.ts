import { useForm } from './use-form';

export const useNotionalSizeFlip = () => {
  const form = useForm();

  return () => {
    const values = form.getValues();

    if (
      values.ticketType === 'stopLimit' ||
      values.ticketType === 'stopMarket'
    ) {
      throw new Error(
        `cannot switch sizeMode for ticket type: ${values.ticketType}`
      );
    }

    if (values.sizeMode === 'contracts') {
      form.setValue('sizeMode', 'notional');
    } else if (values.sizeMode === 'notional') {
      form.setValue('sizeMode', 'contracts');
    }
  };
};
