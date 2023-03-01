import type { OrderObj } from '@vegaprotocol/orders';
import { createOrder, useOrderStore } from '@vegaprotocol/orders';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export type OrderFormFields = OrderObj & {
  summary: string;
};

export const useOrderForm = (marketId: string) => {
  const [order, update] = useOrderStore((store) => {
    return [store.orders[marketId], store.update];
  });
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

  // add new order to store if it doesn exist
  useEffect(() => {
    if (!order) {
      console.log('update here');
      update(createOrder(marketId));
    }
  }, [order, marketId, update]);

  // update useForm field state with values on change of html input
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
