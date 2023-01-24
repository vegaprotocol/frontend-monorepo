import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { memo, useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { DealTicketAmount } from './deal-ticket-amount';
import { DealTicketButton } from './deal-ticket-button';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { normalizeOrderSubmission } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { useOrderMarginValidation } from '../../hooks/use-order-margin-validation';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import { usePersistedOrderStore } from '../../hooks/use-persisted-order';
import {
  getDefaultOrder,
  validateMarketState,
  validateMarketTradingMode,
  validateTimeInForce,
  validateType,
} from '../../utils';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { SummaryValidationType } from '../../constants';
import { useHasNoBalance } from '../../hooks/use-has-no-balance';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: MarketDealTicket;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
}

export type DealTicketFormFields = OrderSubmissionBody['orderSubmission'] & {
  // This is not a field used in the form but allows us to set a
  // summary error message
  summary: string;
};

export const DealTicket = ({ market, submit }: DealTicketProps) => {
  const { pubKey } = useVegaWallet();
  // const [persistedOrder, setPersistedOrder] = usePersistedOrder(market);
  const { getPersistedOrder, setPersistedOrder } = usePersistedOrderStore(
    (store) => ({
      getPersistedOrder: store.getOrder,
      setPersistedOrder: store.setOrder,
    })
  );
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DealTicketFormFields>({
    defaultValues: getPersistedOrder(market.id) || getDefaultOrder(market),
  });

  const order = watch();
  const marketStateError = validateMarketState(market.data.marketState);
  const hasNoBalance = useHasNoBalance(
    market.tradableInstrument.instrument.product.settlementAsset.id
  );
  const marketTradingModeError = validateMarketTradingMode(
    market.data.marketTradingMode
  );
  useEffect(() => {
    if (
      (!hasNoBalance &&
        errors.summary?.type === SummaryValidationType.NoCollateral) ||
      (marketStateError === true &&
        errors.summary?.type === SummaryValidationType.MarketState) ||
      (marketTradingModeError === true &&
        errors.summary?.type === SummaryValidationType.TradingMode)
    ) {
      clearErrors('summary');
    }
  }, [
    hasNoBalance,
    marketStateError,
    marketTradingModeError,
    clearErrors,
    errors.summary?.message,
    errors.summary?.type,
  ]);

  // When order state changes persist it in local storage
  useEffect(() => setPersistedOrder(order), [order, setPersistedOrder]);

  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (!pubKey) {
        setError('summary', { message: t('No public key selected') });
        return;
      }

      if (marketStateError !== true) {
        setError('summary', {
          message: marketStateError,
          type: SummaryValidationType.MarketState,
        });
        return;
      }

      if (hasNoBalance) {
        setError('summary', {
          message: SummaryValidationType.NoCollateral,
          type: SummaryValidationType.NoCollateral,
        });
        return;
      }

      if (marketTradingModeError !== true) {
        setError('summary', {
          message: marketTradingModeError,
          type: SummaryValidationType.TradingMode,
        });
        return;
      }

      submit(
        normalizeOrderSubmission(
          order,
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      );
    },
    [
      submit,
      pubKey,
      hasNoBalance,
      market.positionDecimalPlaces,
      market.decimalPlaces,
      marketStateError,
      marketTradingModeError,
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
        variant={order.side === Schema.Side.SIDE_BUY ? 'ternary' : 'secondary'}
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
  market: MarketDealTicket;
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
    if (errorMessage === SummaryValidationType.NoCollateral) {
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
      ].includes(market.data.marketTradingMode)
    ) {
      return (
        <div
          className="text-sm text-warning mb-4"
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
