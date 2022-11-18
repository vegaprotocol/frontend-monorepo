import { removeDecimal, t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { memo, useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { useOrderMarginValidation } from '../../hooks/use-order-margin-validation';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import { usePersistedOrder } from '../../hooks/use-persisted-order';
import {
  getDefaultOrder,
  validateMarketState,
  validateMarketTradingMode,
  validateTimeInForce,
  validateType,
} from '../../utils';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { AccountValidationType } from '../../constants';
import { useHasNoBalance } from '../../hooks/use-has-no-balance';

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
  const setPersistedOrderRef = useRef(setPersistedOrder);
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
  // When order state changes persist it in local storage
  useEffect(() => {
    setPersistedOrderRef.current(order);
  }, [order]);
  const hasNoBalance = useHasNoBalance(
    market.tradableInstrument.instrument.product.settlementAsset.id
  );
  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (!pubKey) {
        setError('summary', { message: t('No public key selected') });
        return;
      }

      const marketStateError = validateMarketState(market.state);
      if (marketStateError !== true) {
        setError('summary', { message: marketStateError });
        return;
      }

      if (hasNoBalance) {
        setError('summary', { message: AccountValidationType.NoCollateral });
        return;
      }

      const marketTradingModeError = validateMarketTradingMode(
        market.tradingMode
      );
      if (marketTradingModeError !== true) {
        setError('summary', { message: marketTradingModeError });
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
      hasNoBalance,
      market.positionDecimalPlaces,
      market.decimalPlaces,
      market.state,
      market.tradingMode,
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
            market={market}
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
            market={market}
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
      <DealTicketButton
        disabled={Object.keys(errors).length >= 1}
        transactionStatus={transactionStatus}
      />
      <SummaryMessage
        errorMessage={errors.summary?.message}
        market={market}
        order={order}
      />
      <DealTicketFeeDetails order={order} market={market} />
    </form>
  );
};

/**
 * Renders an error message if errors.summary is present otherwise
 * renders warnings about current state of the market
 */
interface SummaryMessageProps {
  errorMessage?: string;
  market: DealTicketMarketFragment;
  order: OrderSubmissionBody['orderSubmission'];
}
const SummaryMessage = memo(
  ({ errorMessage, market, order }: SummaryMessageProps) => {
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    const asset = market.tradableInstrument.instrument.product.settlementAsset;
    const { balanceError, balance, margin } = useOrderMarginValidation({
      market,
      order,
    });
    if (errorMessage === AccountValidationType.NoCollateral) {
      return (
        <ZeroBalanceError
          asset={market.tradableInstrument.instrument.product.settlementAsset}
        />
      );
    }

    // If we have any other full error which prevents
    // submission render that first
    if (errorMessage) {
      return (
        <div className="mb-4">
          <InputError data-testid="dealticket-error-message-summary">
            {errorMessage}
          </InputError>
        </div>
      );
    }

    // If there is no blocking error but user doesn't have enough
    // balance render the margin warning, but still allow submission
    if (balanceError) {
      return <MarginWarning balance={balance} margin={margin} asset={asset} />;
    }

    // Show auction mode warning
    if (
      [
        Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      ].includes(market.tradingMode)
    ) {
      return (
        <div
          className="text-sm text-vega-orange mb-4"
          data-testid="dealticket-warning-auction"
        >
          <p>
            {t('Any orders placed now will not trade until the auction ends')}
          </p>
        </div>
      );
    }

    return null;
  }
);
