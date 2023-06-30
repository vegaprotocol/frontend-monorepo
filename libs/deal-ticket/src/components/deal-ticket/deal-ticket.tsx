import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
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
  Checkbox,
  ExternalLink,
  InputError,
  Intent,
  Notification,
  Tooltip,
  TinyScroll,
} from '@vegaprotocol/ui-toolkit';

import {
  useEstimatePositionQuery,
  useOpenVolume,
} from '@vegaprotocol/positions';
import { toBigNum, removeDecimal } from '@vegaprotocol/utils';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { useEstimateFees } from '../../hooks/use-estimate-fees';
import { getDerivedPrice } from '../../utils/get-price';
import type { OrderInfo } from '@vegaprotocol/types';

import {
  validateExpiration,
  validateMarketState,
  validateMarketTradingMode,
  validateTimeInForce,
  validateType,
} from '../../utils';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { SummaryValidationType } from '../../constants';
import type { Market, MarketData } from '@vegaprotocol/markets';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import {
  useMarketAccountBalance,
  useAccountBalance,
} from '@vegaprotocol/accounts';

import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { useOrderForm } from '../../hooks/use-order-form';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { DealTicketSizeIceberg } from './deal-ticket-size-iceberg';

export interface DealTicketProps {
  market: Market;
  marketData: MarketData;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  submit: (order: OrderSubmission) => void;
  onClickCollateral?: () => void;
}

export const DealTicket = ({
  market,
  onMarketClick,
  marketData,
  submit,
  onClickCollateral,
}: DealTicketProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  // store last used tif for market so that when changing OrderType the previous TIF
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

  const lastSubmitTime = useRef(0);

  const asset = market.tradableInstrument.instrument.product.settlementAsset;

  const { accountBalance: marginAccountBalance } = useMarketAccountBalance(
    market.id
  );

  const { accountBalance: generalAccountBalance } = useAccountBalance(asset.id);

  const balance = (
    BigInt(marginAccountBalance) + BigInt(generalAccountBalance)
  ).toString();

  const { marketState, marketTradingMode } = marketData;

  const normalizedOrder =
    order &&
    normalizeOrderSubmission(
      order,
      market.decimalPlaces,
      market.positionDecimalPlaces
    );

  const price = useMemo(() => {
    return normalizedOrder && getDerivedPrice(normalizedOrder, marketData);
  }, [normalizedOrder, marketData]);

  const notionalSize = useMemo(() => {
    if (price && normalizedOrder?.size) {
      return removeDecimal(
        toBigNum(
          normalizedOrder.size,
          market.positionDecimalPlaces
        ).multipliedBy(toBigNum(price, market.decimalPlaces)),
        market.decimalPlaces
      );
    }
    return null;
  }, [
    price,
    normalizedOrder?.size,
    market.decimalPlaces,
    market.positionDecimalPlaces,
  ]);

  const feeEstimate = useEstimateFees(
    normalizedOrder && { ...normalizedOrder, price }
  );
  const { data: activeOrders } = useDataProvider({
    dataProvider: activeOrdersProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const openVolume = useOpenVolume(pubKey, market.id) ?? '0';
  const orders = activeOrders
    ? activeOrders.map<OrderInfo>((order) => ({
        isMarketOrder: order.type === OrderType.TYPE_MARKET,
        price: order.price,
        remaining: order.remaining,
        side: order.side,
      }))
    : [];
  if (normalizedOrder) {
    orders.push({
      isMarketOrder: normalizedOrder.type === OrderType.TYPE_MARKET,
      price: normalizedOrder.price ?? '0',
      remaining: normalizedOrder.size,
      side: normalizedOrder.side,
    });
  }
  const { data: positionEstimate } = useEstimatePositionQuery({
    variables: {
      marketId: market.id,
      openVolume,
      orders,
      collateralAvailable:
        marginAccountBalance || generalAccountBalance ? balance : undefined,
    },
    skip: !normalizedOrder,
    fetchPolicy: 'no-cache',
  });

  const assetSymbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  useEffect(() => {
    if (!pubKey) {
      setError('summary', {
        message: t('No public key selected'),
        type: SummaryValidationType.NoPubKey,
      });
      return;
    }

    const marketStateError = validateMarketState(marketState);
    if (marketStateError !== true) {
      setError('summary', {
        message: marketStateError,
        type: SummaryValidationType.MarketState,
      });
      return;
    }

    const hasNoBalance =
      !BigInt(generalAccountBalance) && !BigInt(marginAccountBalance);
    if (hasNoBalance) {
      setError('summary', {
        message: SummaryValidationType.NoCollateral,
        type: SummaryValidationType.NoCollateral,
      });
      return;
    }

    const marketTradingModeError = validateMarketTradingMode(marketTradingMode);
    if (marketTradingModeError !== true) {
      setError('summary', {
        message: marketTradingModeError,
        type: SummaryValidationType.TradingMode,
      });
      return;
    }

    // No error found above clear the error in case it was active on a previous render
    clearErrors('summary');
  }, [
    marketState,
    marketTradingMode,
    generalAccountBalance,
    marginAccountBalance,
    pubKey,
    setError,
    clearErrors,
  ]);

  const disablePostOnlyCheckbox = useMemo(() => {
    const disabled = order
      ? [
          Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
          Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        ].includes(order.timeInForce)
      : true;
    return disabled;
  }, [order]);

  const disableReduceOnlyCheckbox = useMemo(() => {
    const disabled = order
      ? ![
          Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
          Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        ].includes(order.timeInForce)
      : true;
    return disabled;
  }, [order]);

  const onSubmit = useCallback(
    (order: OrderSubmission) => {
      const now = new Date().getTime();
      if (lastSubmitTime.current && now - lastSubmitTime.current < 1000) {
        return;
      }
      submit(
        normalizeOrderSubmission(
          order,
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      );
      lastSubmitTime.current = now;
    },
    [submit, market.decimalPlaces, market.positionDecimalPlaces]
  );

  // if an order doesn't exist one will be created by the store immediately
  if (!order || !normalizedOrder) return null;

  return (
    <TinyScroll className="h-full overflow-auto">
      <form
        onSubmit={isReadOnly ? undefined : handleSubmit(onSubmit)}
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
                  // when changing type also update the TIF to what was last used of new type
                  timeInForce: lastTIF[type] || order.timeInForce,
                  postOnly:
                    type === OrderType.TYPE_MARKET ? false : order.postOnly,
                  iceberg:
                    type === OrderType.TYPE_MARKET ||
                    [
                      OrderTimeInForce.TIME_IN_FORCE_FOK,
                      OrderTimeInForce.TIME_IN_FORCE_IOC,
                    ].includes(lastTIF[type] || order.timeInForce)
                      ? false
                      : order.iceberg,
                  icebergOpts:
                    type === OrderType.TYPE_MARKET ||
                    [
                      OrderTimeInForce.TIME_IN_FORCE_FOK,
                      OrderTimeInForce.TIME_IN_FORCE_IOC,
                    ].includes(lastTIF[type] || order.timeInForce)
                      ? undefined
                      : order.icebergOpts,
                  reduceOnly:
                    type === OrderType.TYPE_LIMIT &&
                    ![
                      OrderTimeInForce.TIME_IN_FORCE_FOK,
                      OrderTimeInForce.TIME_IN_FORCE_IOC,
                    ].includes(lastTIF[type] || order.timeInForce)
                      ? false
                      : order.postOnly,
                  expiresAt: undefined,
                });
                clearErrors(['expiresAt', 'price']);
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
                // Reset post only and reduce only when changing TIF
                update({
                  timeInForce,
                  postOnly: [
                    OrderTimeInForce.TIME_IN_FORCE_FOK,
                    OrderTimeInForce.TIME_IN_FORCE_IOC,
                  ].includes(timeInForce)
                    ? false
                    : order.postOnly,
                  reduceOnly: ![
                    OrderTimeInForce.TIME_IN_FORCE_FOK,
                    OrderTimeInForce.TIME_IN_FORCE_IOC,
                  ].includes(timeInForce)
                    ? false
                    : order.reduceOnly,
                });
                // Set TIF value for the given order type, so that when switching
                // types we know the last used TIF for the given order type
                setLastTIF((curr) => ({
                  ...curr,
                  [order.type]: timeInForce,
                  expiresAt: undefined,
                }));
                clearErrors('expiresAt');
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
              rules={{
                validate: validateExpiration,
              }}
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
        <div className="flex gap-2 pb-2 justify-between">
          <Controller
            name="postOnly"
            control={control}
            render={() => (
              <Checkbox
                name="post-only"
                checked={order.postOnly}
                disabled={disablePostOnlyCheckbox}
                onCheckedChange={() => {
                  update({ postOnly: !order.postOnly, reduceOnly: false });
                }}
                label={
                  <Tooltip
                    description={
                      <span>
                        {disablePostOnlyCheckbox
                          ? t(
                              '"Post only" can not be used on "Fill or Kill" or "Immediate or Cancel" orders.'
                            )
                          : t(
                              '"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.'
                            )}
                      </span>
                    }
                  >
                    <span className="text-xs">{t('Post only')}</span>
                  </Tooltip>
                }
              />
            )}
          />
          <Controller
            name="reduceOnly"
            control={control}
            render={() => (
              <Checkbox
                name="reduce-only"
                checked={order.reduceOnly}
                disabled={disableReduceOnlyCheckbox}
                onCheckedChange={() => {
                  update({ postOnly: false, reduceOnly: !order.reduceOnly });
                }}
                label={
                  <Tooltip
                    description={
                      <span>
                        {disableReduceOnlyCheckbox
                          ? t(
                              '"Reduce only" can be used only with non-persistent orders, such as "Fill or Kill" or "Immediate or Cancel".'
                            )
                          : t(
                              '"Reduce only" will ensure that this order will not increase the size of an open position. When the order is matched, it will only trade enough volume to bring your open volume towards 0 but never change the direction of your position. If applied to a limit order that is not instantly filled, the order will be stopped.'
                            )}
                      </span>
                    }
                  >
                    <span className="text-xs">{t('Reduce only')}</span>
                  </Tooltip>
                }
              />
            )}
          />
        </div>
        <div className="flex gap-2 pb-2 justify-between">
          {order.type === Schema.OrderType.TYPE_LIMIT && (
            <Controller
              name="iceberg"
              control={control}
              render={() => (
                <Checkbox
                  name="iceberg"
                  checked={order.iceberg}
                  onCheckedChange={() => {
                    update({ iceberg: !order.iceberg, icebergOpts: undefined });
                  }}
                  label={
                    <Tooltip
                      description={
                        <p>
                          {t(`Trade only a fraction of the order size at once.
                            After the peak size of the order has traded, the size is reset. This is repeated until the order is cancelled, expires, or its full volume trades away.
                            For example, an iceberg order with a size of 1000 and a peak size of 100 will effectively be split into 10 orders with a size of 100 each.
                            Note that the full volume of the order is not hidden and is still reflected in the order book.`)}
                        </p>
                      }
                    >
                      <span className="text-xs">{t('Iceberg')}</span>
                    </Tooltip>
                  }
                />
              )}
            />
          )}
        </div>
        {order.iceberg && (
          <DealTicketSizeIceberg
            update={update}
            market={market}
            peakSizeError={errors.icebergOpts?.peakSize?.message}
            minimumVisibleSizeError={
              errors.icebergOpts?.minimumVisibleSize?.message
            }
            control={control}
            size={order.size}
            peakSize={order.icebergOpts?.peakSize || ''}
            minimumVisibleSize={order.icebergOpts?.minimumVisibleSize || ''}
          />
        )}
        <SummaryMessage
          errorMessage={errors.summary?.message}
          asset={asset}
          marketTradingMode={marketData.marketTradingMode}
          balance={balance}
          margin={
            positionEstimate?.estimatePosition?.margin.bestCase.initialLevel ||
            '0'
          }
          isReadOnly={isReadOnly}
          pubKey={pubKey}
          onClickCollateral={onClickCollateral}
        />
        <DealTicketButton side={order.side} />
        <DealTicketFeeDetails
          onMarketClick={onMarketClick}
          feeEstimate={feeEstimate}
          notionalSize={notionalSize}
          assetSymbol={assetSymbol}
          marginAccountBalance={marginAccountBalance}
          generalAccountBalance={generalAccountBalance}
          positionEstimate={positionEstimate?.estimatePosition}
          market={market}
        />
      </form>
    </TinyScroll>
  );
};

/**
 * Renders an error message if errors.summary is present otherwise
 * renders warnings about current state of the market
 */
interface SummaryMessageProps {
  errorMessage?: string;
  asset: { id: string; symbol: string; name: string; decimals: number };
  marketTradingMode: MarketData['marketTradingMode'];
  balance: string;
  margin: string;
  isReadOnly: boolean;
  pubKey: string | null;
  onClickCollateral?: () => void;
}
const SummaryMessage = memo(
  ({
    errorMessage,
    asset,
    marketTradingMode,
    balance,
    margin,
    isReadOnly,
    pubKey,
    onClickCollateral,
  }: SummaryMessageProps) => {
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    const assetSymbol = asset.symbol;
    const openVegaWalletDialog = useVegaWalletDialogStore(
      (store) => store.openVegaWalletDialog
    );
    if (isReadOnly) {
      return (
        <div className="mb-2">
          <InputError testId="deal-ticket-error-message-summary">
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
              size: 'sm',
            }}
          />
        </div>
      );
    }
    if (errorMessage === SummaryValidationType.NoCollateral) {
      return (
        <div className="mb-2">
          <ZeroBalanceError
            asset={asset}
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
          <InputError testId="deal-ticket-error-message-summary">
            {errorMessage}
          </InputError>
        </div>
      );
    }

    // If there is no blocking error but user doesn't have enough
    // balance render the margin warning, but still allow submission
    if (BigInt(balance) < BigInt(margin) && BigInt(balance) > BigInt(0)) {
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
      ].includes(marketTradingMode)
    ) {
      return (
        <div className="mb-2">
          <Notification
            intent={Intent.Warning}
            testId={'deal-ticket-warning-auction'}
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
