import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { OrderType, OrderTimeInForce } from '@vegaprotocol/wallet';
import { t, addDecimal, toDecimal } from '@vegaprotocol/react-helpers';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { TypeSelector } from './type-selector';
import { SideSelector } from './side-selector';
import { DealTicketAmount } from './deal-ticket-amount';
import { TimeInForceSelector } from './time-in-force-selector';
import { useOrderValidation } from '../hooks/use-order-validation';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import type { Order } from '../utils/get-default-order';
import { getDefaultOrder } from '../utils/get-default-order';
import { ExpirySelector } from './expiry-selector';

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
  } = useForm<Order>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const step = toDecimal(market.positionDecimalPlaces);
  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const invalidText = useOrderValidation({
    step,
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });
  const isDisabled = transactionStatus === 'pending' || Boolean(invalidText);

  const onSubmit = useCallback(
    (order: Order) => {
      if (!isDisabled && !invalidText) {
        submit(order);
      }
    },
    [isDisabled, invalidText, submit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-8" noValidate>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <TypeSelector value={field.value} onSelect={field.onChange} />
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
        step={0.02}
        register={register}
        price={
          market.depth.lastTrade
            ? addDecimal(market.depth.lastTrade.price, market.decimalPlaces)
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
      {orderType === OrderType.Limit &&
        orderTimeInForce === OrderTimeInForce.GTT && (
          <Controller
            name="expiration"
            control={control}
            render={({ field }) => (
              <ExpirySelector value={field.value} onSelect={field.onChange} />
            )}
          />
        )}
      <Button
        className="w-full mb-8"
        variant="primary"
        type="submit"
        disabled={isDisabled}
        data-testid="place-order"
      >
        {transactionStatus === 'pending' ? t('Pending...') : t('Place order')}
      </Button>
      {invalidText && (
        <InputError className="mb-8" data-testid="dealticket-error-message">
          {invalidText}
        </InputError>
      )}
    </form>
  );
};
