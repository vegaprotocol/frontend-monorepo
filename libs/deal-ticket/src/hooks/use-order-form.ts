import type { OrderObj } from '@vegaprotocol/orders';
import { createOrder, useOrder } from '@vegaprotocol/orders';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export type OrderFormFields = OrderObj & {
  summary: string;
};

export const useOrderForm = (marketId: string) => {
  const [order, update] = useOrder(marketId);
  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    getValues,
  } = useForm<OrderFormFields>({
    defaultValues: order || createOrder(marketId),
  });

  // Keep form fields in sync with the store values,
  // inputs are updating the store, fields need updating
  // to ensure validation rules are applied
  useEffect(() => {
    const currOrder = getValues();
    for (const k in order) {
      const key = k as keyof typeof order;
      const curr = currOrder[key];
      const value = order[key];
      if (value !== curr) {
        setValue(key, value, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [order, getValues, setValue]);

  return {
    order,
    update,
    control,
    errors,
    setError,
    clearErrors,
    handleSubmit,
  };
};
