import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { TypeSelector } from './type-selector';
import { SideSelector } from './side-selector';
import { DealTicketAmount } from './deal-ticket-amount';
import { TimeInForceSelector } from './time-in-force-selector';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { ExpirySelector } from './expiry-selector';
import type { Order } from '@vegaprotocol/orders';
import { getDefaultOrder, useOrderValidation } from '@vegaprotocol/orders';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: DealTicketQuery_market;
  submit: (order: Order) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: Order;
}

export const DealTicket = ({
  market,
  submit,
  transactionStatus,
}: DealTicketProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Order>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const { message, isDisabled: disabled } = useOrderValidation({
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });
  const isDisabled = transactionStatus === 'pending' || disabled;

  const onSubmit = useCallback(
    (order: Order) => {
      if (!isDisabled) {
        submit(order);
      }
    },
    [isDisabled, submit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-12 py-8" noValidate>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <TypeSelector
            value={field.value}
            onSelect={(type) => {
              if (type === OrderType.TYPE_LIMIT) {
                setValue('timeInForce', OrderTimeInForce.TIME_IN_FORCE_GTC);
              } else {
                setValue('timeInForce', OrderTimeInForce.TIME_IN_FORCE_IOC);
              }
              field.onChange(type);
            }}
          />
        )}
      />
      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onSelect={field.onChange} />
        )}
      />
      <DealTicketAmount
        orderType={orderType}
        market={market}
        register={register}
        price={
          market.depth.lastTrade
            ? addDecimalsFormatNumber(
                market.depth.lastTrade.price,
                market.decimalPlaces
              )
            : undefined
        }
        quoteName={market.tradableInstrument.instrument.product.quoteName}
      />
      <Controller
        name="timeInForce"
        control={control}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={orderType}
            onSelect={field.onChange}
          />
        )}
      />
      {orderType === OrderType.TYPE_LIMIT &&
        orderTimeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiration"
            control={control}
            render={({ field }) => (
              <ExpirySelector value={field.value} onSelect={field.onChange} />
            )}
          />
        )}
      <div className="mb-8">
        <Button
          variant="primary"
          fill={true}
          type="submit"
          disabled={isDisabled}
          data-testid="place-order"
        >
          {transactionStatus === 'pending' ? t('Pending...') : t('Place order')}
        </Button>
      </div>
      {message && (
        <InputError
          intent={isDisabled ? 'danger' : 'warning'}
          className="mt-12 mb-12"
          data-testid="dealticket-error-message"
        >
          {message}
        </InputError>
      )}
    </form>
  );
};
