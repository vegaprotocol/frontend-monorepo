import { addDecimal, removeDecimal } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  getFeeDetailsValues,
  useFeeDealTicketDetails,
} from '../../hooks/use-fee-deal-ticket-details';
import { getDefaultOrder } from '../deal-ticket-validation';
import {
  isMarketInAuction,
  useOrderValidation,
} from '../deal-ticket-validation/use-order-validation';
import { DealTicketAmount } from './deal-ticket-amount';
import { DealTicketButton } from './deal-ticket-button';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';

import type { DealTicketMarketFragment } from './__generated__/DealTicket';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { DealTicketErrorMessage } from './deal-ticket-error';

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
  const [errorMessage, setErrorMessage] = useState<
    DealTicketErrorMessage | undefined
  >(undefined);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitted },
  } = useForm<OrderSubmissionBody['orderSubmission']>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });
  const order = watch();

  const feeDetails = useFeeDealTicketDetails(order, market);
  const details = getFeeDetailsValues(feeDetails);

  const {
    message,
    isDisabled: disabled,
    section: errorSection,
  } = useOrderValidation({
    market,
    orderType: order.type,
    orderTimeInForce: order.timeInForce,
    fieldErrors: errors,
    estMargin: feeDetails.estMargin,
  });

  useEffect(() => {
    if (disabled) {
      setError('marketId', {});
    } else {
      clearErrors('marketId');
    }
  }, [disabled, setError, clearErrors]);

  useEffect(() => {
    if (isSubmitted) {
      setErrorMessage({ message, isDisabled: disabled, errorSection });
    } else {
      setErrorMessage(undefined);
    }
  }, [disabled, message, errorSection, isSubmitted]);

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
            order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
              ? order.expiresAt
              : undefined,
        });
      }
    },
    [isDisabled, submit, market.decimalPlaces, market.positionDecimalPlaces]
  );

  const getEstimatedMarketPrice = () => {
    if (isMarketInAuction(market)) {
      // 0 can never be a valid uncrossing price
      // as it would require there being orders on the book at that price.
      if (
        market.data?.indicativePrice &&
        BigInt(market.data?.indicativePrice) !== BigInt(0)
      ) {
        return market.data.indicativePrice;
      }
      return undefined;
    }
    return market.depth.lastTrade?.price;
  };
  const marketPrice = getEstimatedMarketPrice();
  const marketPriceFormatted =
    marketPrice && addDecimal(marketPrice, market.decimalPlaces);
  useEffect(() => {
    if (marketPriceFormatted && order.type === Schema.OrderType.TYPE_MARKET) {
      setValue('price', marketPriceFormatted);
    }
  }, [marketPriceFormatted, order.type, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4" noValidate>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <TypeSelector
            value={field.value}
            onSelect={field.onChange}
            errorMessage={errorMessage}
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
        errorMessage={errorMessage}
      />
      <Controller
        name="timeInForce"
        control={control}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={order.type}
            onSelect={field.onChange}
            errorMessage={errorMessage}
          />
        )}
      />
      {order.type === Schema.OrderType.TYPE_LIMIT &&
        order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <ExpirySelector
                value={field.value}
                onSelect={field.onChange}
                errorMessage={errorMessage}
              />
            )}
          />
        )}
      <DealTicketButton
        transactionStatus={transactionStatus}
        isDisabled={isSubmitted && isDisabled}
        errorMessage={errorMessage}
      />
      <DealTicketFeeDetails details={details} />
    </form>
  );
};
