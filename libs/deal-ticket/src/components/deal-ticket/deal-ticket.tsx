import { addDecimal, removeDecimal, t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  getFeeDetailsValues,
  useFeeDealTicketDetails,
} from '../../hooks/use-fee-deal-ticket-details';
import { getDefaultOrder, usePersistedOrder } from '../deal-ticket-validation';
import {
  isMarketInAuction,
  marketTranslations,
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
import { useVegaWallet } from '@vegaprotocol/wallet';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { useOrderMarginValidation } from '../deal-ticket-validation/use-order-margin-validation';
import { ValidateMargin } from '../deal-ticket-validation/validate-margin';
import { validateType } from '../deal-ticket-validation/validate-type';
import { validateTimeInForce } from '../deal-ticket-validation/validate-time-in-force';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: DealTicketMarketFragment;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: OrderSubmissionBody['orderSubmission'];
}

export type DealTicketFormFields = OrderSubmissionBody['orderSubmission'] & {
  // This is not a field used in the form but allows us to set a
  // summary error message
  summary: string;
};

export const DealTicket = ({
  market,
  submit,
  transactionStatus,
}: DealTicketProps) => {
  const { pubKey } = useVegaWallet();
  const [persistedOrder, setPersistedOrder] = usePersistedOrder(market);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<DealTicketFormFields>({
    defaultValues: persistedOrder || getDefaultOrder(market),
  });

  const order = watch();
  const feeDetails = useFeeDealTicketDetails(order, market);
  const details = getFeeDetailsValues(feeDetails);

  // When order state changes persist it in local storage
  useEffect(() => setPersistedOrder(order), [order, setPersistedOrder]);

  const isInvalidOrderMargin = useOrderMarginValidation({
    market,
    estMargin: feeDetails.estMargin,
  });

  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (!pubKey) {
        setError('summary', { message: t('No public key selected') });
        return;
      }

      if (
        [
          Schema.MarketState.STATE_SETTLED,
          Schema.MarketState.STATE_REJECTED,
          Schema.MarketState.STATE_TRADING_TERMINATED,
          Schema.MarketState.STATE_CANCELLED,
          Schema.MarketState.STATE_CLOSED,
        ].includes(market.state)
      ) {
        setError('summary', {
          message: t(
            `This market is ${marketTranslations(
              market.state
            )} and not accepting orders`
          ),
        });
        return;
      }

      if (
        [
          Schema.MarketState.STATE_PROPOSED,
          Schema.MarketState.STATE_PENDING,
        ].includes(market.state)
      ) {
        setError('summary', {
          message: t(
            `This market is ${marketTranslations(
              market.state
            )} and only accepting liquidity commitment orders`
          ),
        });
        return;
      }

      if (isInvalidOrderMargin) {
        setError('summary', {
          message: <ValidateMargin {...isInvalidOrderMargin} />,
        });
        return;
      }

      if (
        [
          Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
          Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
          Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
        ].includes(market.tradingMode)
      ) {
        setError('summary', {
          message: t(
            'Any orders placed now will not trade until the auction ends'
          ),
        });
        return;
      }

      submit({
        ...order,
        price: order.price && removeDecimal(order.price, market.decimalPlaces),
        size: removeDecimal(order.size, market.positionDecimalPlaces),
        expiresAt:
          order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
            ? order.expiresAt
            : undefined,
      });
    },
    [
      submit,
      pubKey,
      market.positionDecimalPlaces,
      market.decimalPlaces,
      market.state,
      market.tradingMode,
      isInvalidOrderMargin,
      setError,
    ]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4" noValidate>
      <Controller
        name="type"
        control={control}
        rules={{
          validate: validateType(market),
        }}
        render={({ field }) => (
          <TypeSelector
            value={field.value}
            onSelect={field.onChange}
            errorMessage={errors.type?.message}
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
        sizeError={errors.size?.message}
        priceError={errors.price?.message}
      />
      <Controller
        name="timeInForce"
        control={control}
        rules={{
          validate: validateTimeInForce(market),
        }}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={order.type}
            onSelect={field.onChange}
            errorMessage={errors.timeInForce?.message}
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
                errorMessage={errors.expiresAt?.message}
                register={register}
              />
            )}
          />
        )}
      <DealTicketButton transactionStatus={transactionStatus} />
      {errors.summary?.message && (
        <InputError>{errors.summary.message}</InputError>
      )}
      <DealTicketFeeDetails details={details} />
    </form>
  );
};
