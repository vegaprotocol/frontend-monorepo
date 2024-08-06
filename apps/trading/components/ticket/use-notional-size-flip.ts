import { useForm } from './use-form';

export const useNotionalSizeFlip = () => {
  const form = useForm();

  return () => {
    const values = form.getValues();

    if (values.sizeMode === 'contracts') {
      form.setValue('sizeMode', 'notional');
    } else if (values.sizeMode === 'notional') {
      form.setValue('sizeMode', 'contracts');
    }
  };
};
