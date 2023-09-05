import omit from 'lodash/omit';
import type { OrderObj } from '@vegaprotocol/orders';
import { getDefaultOrder, useOrder } from '@vegaprotocol/orders';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import type { Exact } from 'type-fest';

export type OrderFormFields = OrderObj & {
  summary: string;
};

/**
 * Connects the order store to a react-hook-form instance. Any time a field
 * changes in the store the form will be updated so that validation rules
 * for those fields are applied
 */
export const useOrderForm = (marketId: string) => {
  const [order, update] = useOrder(marketId);
  const {
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    getValues,
  } = useForm<OrderFormFields>({
    // order can be undefined if there is nothing in the store, it
    // will be created but the form still needs some default values
    defaultValues: order || getDefaultOrder(marketId),
  });

  // Keep form fields in sync with the store values,
  // inputs are updating the store, fields need updating
  // to ensure validation rules are applied
  useEffect(() => {
    if (!order) return;
    const currOrder = getValues();
    for (const k in order) {
      const key = k as keyof typeof order;
      const curr = currOrder[key];
      const value = order[key];
      if (value !== curr) {
        setValue(key, value, {
          shouldValidate: isSubmitted, // only apply validation after the form has been submitted and failed
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [order, isSubmitted, getValues, setValue]);

  const handleSubmitWrapper = (
    cb: <T>(o: Exact<OrderSubmission, T>) => void
  ) => {
    return handleSubmit(() => {
      // remove the persist key from the order in the store, the wallet will reject
      // an order that contains unrecognized additional keys
      cb(omit(order, 'persist'));
    });
  };

  return {
    order,
    update,
    control,
    errors,
    setError,
    clearErrors,
    getValues, // returned for test purposes only
    handleSubmit: handleSubmitWrapper,
  };
};
