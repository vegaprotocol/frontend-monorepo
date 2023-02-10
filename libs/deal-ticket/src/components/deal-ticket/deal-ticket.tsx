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
import type { Market, MarketData } from '@vegaprotocol/market-list';
import {
  usePersistedOrderStore,
  usePersistedOrderStoreSubscription,
} from '@vegaprotocol/orders';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: Market;
  marketData: MarketData;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
}

export type DealTicketFormFields = OrderSubmissionBody['orderSubmission'] & {
  // This is not a field used in the form but allows us to set a
  // summary error message
  summary: string;
};

export const DealTicket = ({ market, marketData, submit }: DealTicketProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
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
    setValue,
  } = useForm<DealTicketFormFields>({
    defaultValues: getPersistedOrder(market.id) || getDefaultOrder(market),
  });

  const order = watch();

  watch((orderData) => {
    setPersistedOrder(orderData as DealTicketFormFields);
  });

  usePersistedOrderStoreSubscription(market.id, (storedOrder) => {
    if (order.price !== storedOrder.price) {
      clearErrors('price');
      setValue('price', storedOrder.price);
    }
  });

  const marketStateError = validateMarketState(marketData.marketState);
  const hasNoBalance = useHasNoBalance(
    market.tradableInstrument.instrument.product.settlementAsset.id
  );
  const marketTradingModeError = validateMarketTradingMode(
    marketData.marketTradingMode
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
    <form
      onSubmit={isReadOnly ? () => null : handleSubmit(onSubmit)}
      className="p-4"
      noValidate
    >
      <Controller
        name="type"
        control={control}
        rules={{
          validate: validateType(
            marketData.marketTradingMode,
            marketData.trigger
          ),
        }}
        render={({ field }) => (
          <TypeSelector
            value={field.value}
            onSelect={field.onChange}
            market={market}
            marketData={marketData}
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
        marketData={marketData}
        register={register}
        sizeError={errors.size?.message}
        priceError={errors.price?.message}
      />
      <Controller
        name="timeInForce"
        control={control}
        rules={{
          validate: validateTimeInForce(
            marketData.marketTradingMode,
            marketData.trigger
          ),
        }}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={order.type}
            onSelect={field.onChange}
            market={market}
            marketData={marketData}
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
        disabled={Object.keys(errors).length >= 1 || isReadOnly}
        variant={order.side === Schema.Side.SIDE_BUY ? 'ternary' : 'secondary'}
      />
      <SummaryMessage
        errorMessage={errors.summary?.message}
        market={market}
        marketData={marketData}
        order={order}
        isReadOnly={isReadOnly}
      />
      <DealTicketFeeDetails
        order={order}
        market={market}
        marketData={marketData}
      />
    </form>
  );
};

/**
 * Renders an error message if errors.summary is present otherwise
 * renders warnings about current state of the market
 */
interface SummaryMessageProps {
  errorMessage?: string;
  market: Market;
  marketData: MarketData;
  order: OrderSubmissionBody['orderSubmission'];
  isReadOnly: boolean;
}
const SummaryMessage = memo(
  ({
    errorMessage,
    market,
    marketData,
    order,
    isReadOnly,
  }: SummaryMessageProps) => {
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    const asset = market.tradableInstrument.instrument.product.settlementAsset;
    const { balanceError, balance, margin } = useOrderMarginValidation({
      market,
      marketData,
      order,
    });
    if (isReadOnly) {
      return (
        <div className="mb-4">
          <InputError data-testid="dealticket-error-message-summary">
            {
              'You need to connect your own wallet to start trading on this market'
            }
          </InputError>
        </div>
      );
    }
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
      ].includes(marketData.marketTradingMode)
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
