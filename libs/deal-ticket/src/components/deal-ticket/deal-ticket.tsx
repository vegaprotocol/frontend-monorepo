import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import type { FormEventHandler } from 'react';
import { memo, useCallback, useEffect, useRef, useMemo } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import { DealTicketAmount } from './deal-ticket-amount';
import { DealTicketButton } from './deal-ticket-button';
import {
  DealTicketFeeDetails,
  DealTicketMarginDetails,
} from './deal-ticket-fee-details';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { mapFormValuesToOrderSubmission } from '../../utils/map-form-values-to-submission';
import {
  TradingCheckbox,
  TradingInputError,
  Intent,
  Notification,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

import {
  useEstimatePositionQuery,
  useOpenVolume,
} from '@vegaprotocol/positions';
import { toBigNum, removeDecimal } from '@vegaprotocol/utils';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { getAsset, getDerivedPrice } from '@vegaprotocol/markets';
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
import type {
  Market,
  MarketData,
  StaticMarketData,
} from '@vegaprotocol/markets';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import {
  useMarketAccountBalance,
  useAccountBalance,
} from '@vegaprotocol/accounts';

import { OrderType } from '@vegaprotocol/types';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  DealTicketType,
  dealTicketTypeToOrderType,
  isStopOrderType,
} from '../../hooks/use-form-values';
import type { OrderFormValues } from '../../hooks/use-form-values';
import { useDealTicketFormValues } from '../../hooks/use-form-values';
import { DealTicketSizeIceberg } from './deal-ticket-size-iceberg';
import noop from 'lodash/noop';

export const REDUCE_ONLY_TOOLTIP =
  '"Reduce only" will ensure that this order will not increase the size of an open position. When the order is matched, it will only trade enough volume to bring your open volume towards 0 but never change the direction of your position. If applied to a limit order that is not instantly filled, the order will be stopped.';

export interface DealTicketProps {
  market: Market;
  marketData: StaticMarketData;
  marketPrice?: string | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  submit: (order: OrderSubmission) => void;
  onDeposit: (assetId: string) => void;
}

export const getNotionalSize = (
  price: string | null | undefined,
  size: string | undefined,
  decimalPlaces: number,
  positionDecimalPlaces: number
) => {
  if (price && size) {
    return removeDecimal(
      toBigNum(size, positionDecimalPlaces).multipliedBy(
        toBigNum(price, decimalPlaces)
      ),
      decimalPlaces
    );
  }
  return null;
};

export const stopSubmit: FormEventHandler = (e) => e.preventDefault();

const getDefaultValues = (
  type: Schema.OrderType,
  storedValues?: Partial<OrderFormValues>
): OrderFormValues => ({
  type,
  side: Schema.Side.SIDE_BUY,
  timeInForce:
    type === Schema.OrderType.TYPE_LIMIT
      ? Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
      : Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: '0',
  price: '0',
  expiresAt: undefined,
  postOnly: false,
  reduceOnly: false,
  ...storedValues,
});

export const DealTicket = ({
  market,
  onMarketClick,
  marketData,
  marketPrice,
  submit,
  onDeposit,
}: DealTicketProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const setType = useDealTicketFormValues((state) => state.setType);
  const storedFormValues = useDealTicketFormValues(
    (state) => state.formValues[market.id]
  );
  const updateStoredFormValues = useDealTicketFormValues(
    (state) => state.updateOrder
  );
  const dealTicketType = storedFormValues?.type ?? DealTicketType.Limit;
  const type = dealTicketTypeToOrderType(dealTicketType);

  const {
    control,
    reset,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<OrderFormValues>({
    defaultValues: getDefaultValues(type, storedFormValues?.[dealTicketType]),
  });
  const lastSubmitTime = useRef(0);

  const asset = getAsset(market);
  const {
    accountBalance: marginAccountBalance,
    loading: loadingMarginAccountBalance,
  } = useMarketAccountBalance(market.id);

  const {
    accountBalance: generalAccountBalance,
    loading: loadingGeneralAccountBalance,
  } = useAccountBalance(asset.id);

  const balance = (
    BigInt(marginAccountBalance) + BigInt(generalAccountBalance)
  ).toString();

  const { marketState, marketTradingMode } = marketData;
  const timeInForce = watch('timeInForce');

  const side = watch('side');
  const rawSize = watch('size');
  const rawPrice = watch('price');
  const iceberg = watch('iceberg');
  const peakSize = watch('peakSize');

  useEffect(() => {
    const size = storedFormValues?.[dealTicketType]?.size;
    if (size && rawSize !== size) {
      setValue('size', size);
    }
  }, [storedFormValues, dealTicketType, rawSize, setValue]);

  useEffect(() => {
    const price = storedFormValues?.[dealTicketType]?.price;
    if (price && rawPrice !== price) {
      setValue('price', price);
    }
  }, [storedFormValues, dealTicketType, rawPrice, setValue]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      updateStoredFormValues(market.id, value);
    });
    return () => subscription.unsubscribe();
  }, [watch, market.id, updateStoredFormValues]);

  const normalizedOrder = mapFormValuesToOrderSubmission(
    {
      price: rawPrice || undefined,
      side,
      size: rawSize,
      timeInForce,
      type,
    },
    market.id,
    market.decimalPlaces,
    market.positionDecimalPlaces
  );

  const price =
    normalizedOrder &&
    marketPrice &&
    getDerivedPrice(normalizedOrder, marketPrice);

  const notionalSize = getNotionalSize(
    price,
    normalizedOrder?.size,
    market.decimalPlaces,
    market.positionDecimalPlaces
  );

  const { data: activeOrders } = useDataProvider({
    dataProvider: activeOrdersProvider,
    variables: { partyId: pubKey || '', marketId: market.id },
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

  const summaryError = useMemo(() => {
    if (!pubKey) {
      return {
        message: t('No public key selected'),
        type: SummaryValidationType.NoPubKey,
      };
    }

    const marketStateError = validateMarketState(marketState);
    if (marketStateError !== true) {
      return {
        message: marketStateError,
        type: SummaryValidationType.MarketState,
      };
    }

    const hasNoBalance =
      !BigInt(generalAccountBalance) && !BigInt(marginAccountBalance);
    if (
      hasNoBalance &&
      !(loadingMarginAccountBalance || loadingGeneralAccountBalance)
    ) {
      return {
        message: SummaryValidationType.NoCollateral,
        type: SummaryValidationType.NoCollateral,
      };
    }

    const marketTradingModeError = validateMarketTradingMode(marketTradingMode);
    if (marketTradingModeError !== true) {
      return {
        message: marketTradingModeError,
        type: SummaryValidationType.TradingMode,
      };
    }

    return undefined;
  }, [
    marketState,
    marketTradingMode,
    generalAccountBalance,
    marginAccountBalance,
    loadingMarginAccountBalance,
    loadingGeneralAccountBalance,
    pubKey,
  ]);

  const disablePostOnlyCheckbox = [
    Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  ].includes(timeInForce);

  const disableReduceOnlyCheckbox = !disablePostOnlyCheckbox;

  const onSubmit = useCallback(
    (formValues: OrderFormValues) => {
      const now = new Date().getTime();
      if (lastSubmitTime.current && now - lastSubmitTime.current < 1000) {
        return;
      }
      submit(
        mapFormValuesToOrderSubmission(
          formValues,
          market.id,
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      );
      lastSubmitTime.current = now;
    },
    [submit, market.decimalPlaces, market.positionDecimalPlaces, market.id]
  );
  useController({
    name: 'type',
    control,
    rules: {
      validate: validateType(marketData.marketTradingMode, marketData.trigger),
    },
  });

  return (
    <form
      onSubmit={
        isReadOnly || !pubKey
          ? stopSubmit
          : handleSubmit(summaryError ? noop : onSubmit)
      }
      noValidate
      data-testid="deal-ticket-form"
    >
      <TypeSelector
        value={dealTicketType}
        onValueChange={(dealTicketType) => {
          setType(market.id, dealTicketType);
          if (!isStopOrderType(dealTicketType)) {
            reset(
              getDefaultValues(
                dealTicketTypeToOrderType(dealTicketType),
                storedFormValues?.[dealTicketType]
              )
            );
          }
        }}
        market={market}
        marketData={marketData}
        errorMessage={errors.type?.message}
      />
      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onValueChange={field.onChange} />
        )}
      />
      <DealTicketAmount
        type={type}
        control={control}
        market={market}
        marketData={marketData}
        marketPrice={marketPrice || undefined}
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
            orderType={type}
            onSelect={field.onChange}
            market={market}
            marketData={marketData}
            errorMessage={errors.timeInForce?.message}
          />
        )}
      />
      {type === Schema.OrderType.TYPE_LIMIT &&
        timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiresAt"
            control={control}
            rules={{
              validate: validateExpiration,
            }}
            render={({ field }) => (
              <ExpirySelector
                value={field.value}
                onSelect={(expiresAt) => field.onChange(expiresAt)}
                errorMessage={errors.expiresAt?.message}
              />
            )}
          />
        )}
      <div className="flex gap-2 pb-2 justify-between">
        <Controller
          name="postOnly"
          control={control}
          render={({ field }) => (
            <TradingCheckbox
              name="post-only"
              checked={!disablePostOnlyCheckbox && field.value}
              disabled={disablePostOnlyCheckbox}
              onCheckedChange={(postOnly) => {
                field.onChange(postOnly);
                setValue('reduceOnly', false);
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
          render={({ field }) => (
            <TradingCheckbox
              name="reduce-only"
              checked={!disableReduceOnlyCheckbox && field.value}
              disabled={disableReduceOnlyCheckbox}
              onCheckedChange={(reduceOnly) => {
                field.onChange(reduceOnly);
                setValue('postOnly', false);
              }}
              label={
                <Tooltip
                  description={
                    <span>
                      {disableReduceOnlyCheckbox
                        ? t(
                            '"Reduce only" can be used only with non-persistent orders, such as "Fill or Kill" or "Immediate or Cancel".'
                          )
                        : t(REDUCE_ONLY_TOOLTIP)}
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
      {type === Schema.OrderType.TYPE_LIMIT && (
        <>
          <div className="flex gap-2 pb-2 justify-between">
            <Controller
              name="iceberg"
              control={control}
              render={({ field }) => (
                <TradingCheckbox
                  name="iceberg"
                  checked={field.value}
                  onCheckedChange={field.onChange}
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
          </div>
          {iceberg && (
            <DealTicketSizeIceberg
              market={market}
              peakSizeError={errors.peakSize?.message}
              minimumVisibleSizeError={errors.minimumVisibleSize?.message}
              control={control}
              size={rawSize}
              peakSize={peakSize}
            />
          )}
        </>
      )}
      <SummaryMessage
        error={summaryError}
        asset={asset}
        marketTradingMode={marketData.marketTradingMode}
        balance={balance}
        margin={
          positionEstimate?.estimatePosition?.margin.bestCase.initialLevel ||
          '0'
        }
        isReadOnly={isReadOnly}
        pubKey={pubKey}
        onDeposit={onDeposit}
      />
      <DealTicketButton side={side} />
      <DealTicketFeeDetails
        order={
          normalizedOrder && { ...normalizedOrder, price: price || undefined }
        }
        notionalSize={notionalSize}
        assetSymbol={asset.symbol}
        market={market}
      />
      <DealTicketMarginDetails
        onMarketClick={onMarketClick}
        assetSymbol={asset.symbol}
        marginAccountBalance={marginAccountBalance}
        generalAccountBalance={generalAccountBalance}
        positionEstimate={positionEstimate?.estimatePosition}
        market={market}
      />
    </form>
  );
};

/**
 * Renders an error message if errors.summary is present otherwise
 * renders warnings about current state of the market
 */
interface SummaryMessageProps {
  error?: { message: string; type: string };
  asset: { id: string; symbol: string; name: string; decimals: number };
  marketTradingMode: MarketData['marketTradingMode'];
  balance: string;
  margin: string;
  isReadOnly: boolean;
  pubKey: string | null;
  onDeposit: (assetId: string) => void;
}

export const NoWalletWarning = ({
  isReadOnly,
}: Pick<SummaryMessageProps, 'isReadOnly'>) => {
  if (isReadOnly) {
    return (
      <div className="mb-2">
        <TradingInputError testId="deal-ticket-error-message-summary">
          {
            'You need to connect your own wallet to start trading on this market'
          }
        </TradingInputError>
      </div>
    );
  }
  return null;
};

const SummaryMessage = memo(
  ({
    error,
    asset,
    marketTradingMode,
    balance,
    margin,
    isReadOnly,
    pubKey,
    onDeposit,
  }: SummaryMessageProps) => {
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    if (isReadOnly || !pubKey) {
      return <NoWalletWarning isReadOnly={isReadOnly} />;
    }

    if (error?.type === SummaryValidationType.NoCollateral) {
      return (
        <div className="mb-2">
          <ZeroBalanceError asset={asset} onDeposit={onDeposit} />
        </div>
      );
    }

    // If we have any other full error which prevents
    // submission render that first
    if (error?.message) {
      return (
        <div className="mb-2">
          <TradingInputError testId="deal-ticket-error-message-summary">
            {error?.message}
          </TradingInputError>
        </div>
      );
    }

    // If there is no blocking error but user doesn't have enough
    // balance render the margin warning, but still allow submission
    if (BigInt(balance) < BigInt(margin) && BigInt(balance) > BigInt(0)) {
      return (
        <div className="mb-2">
          <MarginWarning
            balance={balance}
            margin={margin}
            asset={asset}
            onDeposit={onDeposit}
          />
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
