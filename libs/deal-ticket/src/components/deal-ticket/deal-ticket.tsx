import { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  t,
  addDecimalsFormatNumber,
  removeDecimal,
} from '@vegaprotocol/react-helpers';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { TypeSelector } from './type-selector';
import { SideSelector } from './side-selector';
import { DealTicketAmount } from './deal-ticket-amount';
import { TimeInForceSelector } from './time-in-force-selector';
import type { DealTicketMarketFragment } from './__generated___/DealTicket';
import { ExpirySelector } from './expiry-selector';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { getDefaultOrder } from '../deal-ticket-validation';
import {
  isMarketInAuction,
  useOrderValidation,
} from '../deal-ticket-validation/use-order-validation';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import {
  getFeeDetailLabelValues,
  useFeeDealTicketDetails,
} from '../../hooks/use-fee-deal-ticket-details';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: DealTicketMarketFragment;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: OrderSubmissionBody['orderSubmission'];
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
  } = useForm<OrderSubmissionBody['orderSubmission']>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });
  const order = watch();
  const { message, isDisabled: disabled } = useOrderValidation({
    market,
    orderType: order.type,
    orderTimeInForce: order.timeInForce,
    fieldErrors: errors,
  });
  const isDisabled = transactionStatus === 'pending' || disabled;

  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (!isDisabled) {
        submit({
          ...order,
          price:
            order.price && removeDecimal(order.price, market.decimalPlaces),
          size: removeDecimal(order.size, market.positionDecimalPlaces),
          expiresAt:
            order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
              ? order.expiresAt
              : undefined,
        });
      }
    },
    [isDisabled, submit, market.decimalPlaces, market.positionDecimalPlaces]
  );

  const getEstimatedMarketPrice = useCallback(() => {
    if (isMarketInAuction(market)) {
      // 0 can never be a valid uncrossing price
      // as it would require there being orders on the book at that price.
      if (
        market.data?.indicativePrice &&
        BigInt(market.data?.indicativePrice) !== BigInt(0)
      ) {
        return market.data.indicativePrice;
      }
    }
    return market.depth.lastTrade?.price;
  }, [market]);

  useEffect(() => {
    const marketPrice = getEstimatedMarketPrice();
    if (marketPrice) {
      setValue(
        'price',
        addDecimalsFormatNumber(marketPrice, market.decimalPlaces)
      );
    }
  }, [getEstimatedMarketPrice, market.decimalPlaces, setValue]);

  const feeDetails = useFeeDealTicketDetails(order, market);
  const details = getFeeDetailLabelValues(feeDetails);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4" noValidate>
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
                if (
                  order.timeInForce !== OrderTimeInForce.TIME_IN_FORCE_IOC &&
                  order.timeInForce !== OrderTimeInForce.TIME_IN_FORCE_FOK
                ) {
                  setValue('timeInForce', OrderTimeInForce.TIME_IN_FORCE_IOC);
                }
                const marketPrice = getEstimatedMarketPrice();
                if (marketPrice) {
                  setValue(
                    'price',
                    marketPrice &&
                      addDecimalsFormatNumber(marketPrice, market.decimalPlaces)
                  );
                }
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
        orderType={order.type}
        market={market}
        register={register}
        price={order.price}
        quoteName={market.tradableInstrument.instrument.product.quoteName}
      />
      <Controller
        name="timeInForce"
        control={control}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={order.type}
            onSelect={field.onChange}
          />
        )}
      />
      {order.type === OrderType.TYPE_LIMIT &&
        order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <ExpirySelector value={field.value} onSelect={field.onChange} />
            )}
          />
        )}
      <Button
        variant="primary"
        fill={true}
        type="submit"
        disabled={isDisabled}
        data-testid="place-order"
      >
        {transactionStatus === 'pending' ? t('Pending...') : t('Place order')}
      </Button>
      {message && (
        <InputError
          intent={isDisabled ? 'danger' : 'warning'}
          data-testid="dealticket-error-message"
        >
          {message}
        </InputError>
      )}
      <DealTicketFeeDetails details={details} />
    </form>
  );
};
