import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { memo, useCallback, useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { DealTicketAmount } from './deal-ticket-amount';
import { DealTicketButton } from './deal-ticket-button';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import {
  normalizeOrderSubmission,
  useVegaWallet,
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import {
  ExternalLink,
  InputError,
  Intent,
  Notification,
} from '@vegaprotocol/ui-toolkit';
import { useOrderMarginValidation } from '../../hooks/use-order-margin-validation';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import {
  validateMarketState,
  validateMarketTradingMode,
  validateTimeInForce,
  validateType,
} from '../../utils';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { SummaryValidationType } from '../../constants';
import { useHasNoBalance } from '../../hooks/use-has-no-balance';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { useOrderForm } from '../../hooks/use-order-form';
import type { OrderObj } from '@vegaprotocol/orders';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: Market;
  marketData: MarketData;
  submit: (order: OrderSubmission) => void;
  onClickCollateral?: () => void;
}

export type DealTicketFormFields = OrderSubmission & {
  // This is not a field used in the form but allows us to set a
  // summary error message
  summary: string;
};

export const DealTicket = ({
  market,
  marketData,
  submit,
  onClickCollateral,
}: DealTicketProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  // store last used tif for market so that when chaning OrderType the previous TIF
  // selection for that type is used when switching back
  const [lastTIF, setLastTIF] = useState({
    [OrderType.TYPE_MARKET]: OrderTimeInForce.TIME_IN_FORCE_IOC,
    [OrderType.TYPE_LIMIT]: OrderTimeInForce.TIME_IN_FORCE_GTC,
  });
  const {
    control,
    errors,
    order,
    setError,
    clearErrors,
    update,
    handleSubmit,
  } = useOrderForm(market.id);
  const marketStateError = validateMarketState(marketData.marketState);
  const hasNoBalance = useHasNoBalance(
    market.tradableInstrument.instrument.product.settlementAsset.id
  );
  const marketTradingModeError = validateMarketTradingMode(
    marketData.marketTradingMode
  );

  const checkForErrors = useCallback(() => {
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
  }, [
    hasNoBalance,
    marketStateError,
    marketTradingModeError,
    pubKey,
    setError,
  ]);

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
    checkForErrors();
  }, [
    hasNoBalance,
    marketStateError,
    marketTradingModeError,
    clearErrors,
    errors.summary?.message,
    errors.summary?.type,
    checkForErrors,
  ]);

  const onSubmit = useCallback(
    (order: OrderSubmission) => {
      checkForErrors();
      submit(
        normalizeOrderSubmission(
          order,
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      );
    },
    [checkForErrors, submit, market.decimalPlaces, market.positionDecimalPlaces]
  );

  // if an order doesn't exist one will be created by the store immediately
  if (!order) return null;

  return (
    <form
      onSubmit={isReadOnly ? undefined : handleSubmit(onSubmit)}
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
        render={() => (
          <TypeSelector
            value={order.type}
            onSelect={(type) => {
              if (type === OrderType.TYPE_NETWORK) return;
              update({
                type,
                // when changing type also update the tif to what was last used of new type
                timeInForce: lastTIF[type] || order.timeInForce,
              });
            }}
            market={market}
            marketData={marketData}
            errorMessage={errors.type?.message}
          />
        )}
      />
      <Controller
        name="side"
        control={control}
        render={() => (
          <SideSelector
            value={order.side}
            onSelect={(side) => {
              update({ side });
            }}
          />
        )}
      />
      <DealTicketAmount
        control={control}
        orderType={order.type}
        market={market}
        marketData={marketData}
        sizeError={errors.size?.message}
        priceError={errors.price?.message}
        update={update}
        size={order.size}
        price={order.price}
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
        render={() => (
          <TimeInForceSelector
            value={order.timeInForce}
            orderType={order.type}
            onSelect={(timeInForce) => {
              update({ timeInForce });
              setLastTIF((curr) => ({ ...curr, [order.type]: timeInForce }));
            }}
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
            render={() => (
              <ExpirySelector
                value={order.expiresAt}
                onSelect={(expiresAt) =>
                  update({
                    expiresAt: expiresAt || undefined,
                  })
                }
                errorMessage={errors.expiresAt?.message}
              />
            )}
          />
        )}
      <SummaryMessage
        errorMessage={errors.summary?.message}
        market={market}
        marketData={marketData}
        order={order}
        isReadOnly={isReadOnly}
        pubKey={pubKey}
        onClickCollateral={onClickCollateral || (() => null)}
      />
      <DealTicketButton
        disabled={Object.keys(errors).length >= 1 || isReadOnly}
        variant={order.side === Schema.Side.SIDE_BUY ? 'ternary' : 'secondary'}
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
  order: OrderObj;
  isReadOnly: boolean;
  pubKey: string | null;
  onClickCollateral: () => void;
}
const SummaryMessage = memo(
  ({
    errorMessage,
    market,
    marketData,
    order,
    isReadOnly,
    pubKey,
    onClickCollateral,
  }: SummaryMessageProps) => {
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    const asset = market.tradableInstrument.instrument.product.settlementAsset;
    const assetSymbol = asset.symbol;
    const { balanceError, balance, margin } = useOrderMarginValidation({
      market,
      marketData,
      order,
    });
    const openVegaWalletDialog = useVegaWalletDialogStore(
      (store) => store.openVegaWalletDialog
    );
    if (isReadOnly) {
      return (
        <div className="mb-2">
          <InputError testId="dealticket-error-message-summary">
            {
              'You need to connect your own wallet to start trading on this market'
            }
          </InputError>
        </div>
      );
    }
    if (!pubKey) {
      return (
        <div className="mb-2">
          <Notification
            testId={'deal-ticket-connect-wallet'}
            intent={Intent.Warning}
            message={
              <p className="text-sm pb-2">
                You need a{' '}
                <ExternalLink href="https://vega.xyz/wallet">
                  Vega wallet
                </ExternalLink>{' '}
                with {assetSymbol} to start trading in this market.
              </p>
            }
            buttonProps={{
              text: t('Connect wallet'),
              action: openVegaWalletDialog,
              dataTestId: 'order-connect-wallet',
              size: 'md',
            }}
          />
        </div>
      );
    }
    if (errorMessage === SummaryValidationType.NoCollateral) {
      return (
        <div className="mb-2">
          <ZeroBalanceError
            asset={market.tradableInstrument.instrument.product.settlementAsset}
            onClickCollateral={onClickCollateral}
          />
        </div>
      );
    }

    // If we have any other full error which prevents
    // submission render that first
    if (errorMessage) {
      return (
        <div className="mb-2">
          <InputError testId="dealticket-error-message-summary">
            {errorMessage}
          </InputError>
        </div>
      );
    }

    // If there is no blocking error but user doesn't have enough
    // balance render the margin warning, but still allow submission
    if (balanceError) {
      return (
        <div className="mb-2">
          <MarginWarning balance={balance} margin={margin} asset={asset} />
        </div>
      );
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
        <div className="mb-2">
          <Notification
            intent={Intent.Warning}
            testId={'dealticket-warning-auction'}
            message={t(
              'Any orders placed now will not trade until the auction ends'
            )}
          />
        </div>
      );
    }

    return null;
  }
);
