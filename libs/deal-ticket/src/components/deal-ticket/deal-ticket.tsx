import * as Schema from '@vegaprotocol/types';
import { type FormEventHandler } from 'react';
import { memo, useCallback, useEffect, useRef, useMemo } from 'react';
import { Controller, useController, useForm } from 'react-hook-form';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { DealTicketMarginDetails } from './deal-ticket-margin-details';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import {
  TimeInForceError,
  TimeInForceSelector,
} from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type OrderSubmission, type Transaction } from '@vegaprotocol/wallet';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from '../../utils/map-form-values-to-submission';
import {
  TradingCheckbox as Checkbox,
  TradingFormGroup as FormGroup,
  TradingInputError as InputError,
  Intent,
  Notification,
  Tooltip,
  Pill,
  ExternalLink,
  PercentageSlider as Slider,
  TicketInput,
} from '@vegaprotocol/ui-toolkit';

import { useOpenVolume } from '@vegaprotocol/positions';
import {
  toBigNum,
  removeDecimal,
  useValidateAmount,
  formatForInput,
  formatValue,
  toDecimal,
} from '@vegaprotocol/utils';
import { useActiveOrders } from '@vegaprotocol/orders';
import {
  getAsset,
  getBaseAsset,
  getDerivedPrice,
  getQuoteAsset,
  getQuoteName,
  isMarketInAuction,
  isSpot,
} from '@vegaprotocol/markets';
import {
  validateExpiration,
  validateMarketTradingMode,
  validateTimeInForce,
  validateType,
} from '../../utils';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { NotEnoughError } from '../deal-ticket-validation/not-enough-error';
import {
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  REDUCE_ONLY_TOOLTIP,
  SummaryValidationType,
} from '../../constants';
import type {
  Market,
  MarketInfo,
  MarketData,
  StaticMarketData,
} from '@vegaprotocol/markets';
import { MarginWarning } from '../deal-ticket-validation/margin-warning';
import {
  useMarginAccountBalance,
  useAccountBalance,
  marginModeDataProvider,
} from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { usePositionEstimate } from '../../hooks';
import { DealTicketSizeIceberg } from './deal-ticket-size-iceberg';
import noop from 'lodash/noop';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { isNonPersistentOrder } from '../../utils/time-in-force-persistence';
import { KeyValue } from './key-value';
import { DocsLinks, useFeatureFlags } from '@vegaprotocol/environment';
import { useT } from '../../use-t';
import { DealTicketPriceTakeProfitStopLoss } from './deal-ticket-price-tp-sl';
import uniqueId from 'lodash/uniqueId';
import { determinePriceStep, determineSizeStep } from '@vegaprotocol/utils';
import { useMaxSize } from '../../hooks/use-max-size';
import {
  DealTicketType,
  type OrderFormValues,
  dealTicketTypeToOrderType,
  isStopOrderType,
  useDealTicketFormValues,
} from '@vegaprotocol/react-helpers';
import { useSlippage } from '../../hooks/use-slippage';
import BigNumber from 'bignumber.js';
import {
  type AssetFieldsFragment,
  AssetSymbol,
  getAssetSymbol,
} from '@vegaprotocol/assets';
import { SubmitButton } from './submit-button';

export interface DealTicketProps {
  scalingFactors?: NonNullable<
    MarketInfo['tradableInstrument']['marginCalculator']
  >['scalingFactors'];
  riskFactors: MarketInfo['riskFactors'];
  market: Market;
  marketData: StaticMarketData;
  marketPrice?: string | null;
  markPrice?: string | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  submit: (order: Transaction) => void;
  onDeposit: (assetId: string) => void;
}

export const getNotionalSize = (
  price: string | null | undefined,
  size: string | undefined,
  decimalPlaces: number,
  positionDecimalPlaces: number,
  decimals: number
) => {
  if (price && size) {
    return removeDecimal(
      toBigNum(size, positionDecimalPlaces).multipliedBy(
        toBigNum(price, decimalPlaces)
      ),
      decimals
    );
  }
  return undefined;
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
  size: '',
  notional: '0',
  useNotional: false,
  price: '',
  expiresAt: undefined,
  postOnly: false,
  reduceOnly: false,
  peakSize: '',
  minimumVisibleSize: '',
  ...storedValues,
});

export const getBaseQuoteUnit = (tags?: string[] | null) =>
  tags
    ?.find((tag) => tag.startsWith('base:') || tag.startsWith('ticker:'))
    ?.replace(/^[^:]*:/, '');

export const DealTicket = ({
  market,
  riskFactors,
  scalingFactors,
  marketData,
  marketPrice,
  markPrice,
  submit,
  onDeposit,
}: DealTicketProps) => {
  const t = useT();
  const validateAmount = useValidateAmount();
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
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
  const isLimitType = type === Schema.OrderType.TYPE_LIMIT;

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
  const assetSymbol = asset.symbol;
  const baseAsset = isSpotMarket ? getBaseAsset(market) : undefined;
  const quoteName = getQuoteName(market);
  const quoteAsset = getQuoteAsset(market);
  const baseQuote = getBaseQuoteUnit(
    market.tradableInstrument.instrument.metadata.tags
  );

  const {
    orderMarginAccountBalance,
    marginAccountBalance,
    loading: loadingMarginAccountBalance,
  } = useMarginAccountBalance(market.id);

  const {
    accountBalance: generalAccountBalance,
    accountDecimals,
    loading: loadingGeneralAccountBalance,
  } = useAccountBalance(asset.id);

  const {
    accountBalance: baseAssetAccountBalance,
    accountDecimals: baseAssetDecimals,
    loading: loadingBaseAssetAccount,
  } = useAccountBalance(baseAsset?.id);

  const { marketState, marketTradingMode } = marketData;
  const timeInForce = watch('timeInForce');

  const side = watch('side');
  const rawSize = watch('size');
  const rawPrice = watch('price');
  const iceberg = watch('iceberg');
  const tpSl = watch('tpSl');
  const peakSize = watch('peakSize');
  const expiresAt = watch('expiresAt');
  const postOnly = watch('postOnly');
  const useNotional = watch('useNotional');
  const notional = watch('notional');

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
    const subscription = watch((value) => {
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
      postOnly,
    },
    market.id,
    market.decimalPlaces,
    market.positionDecimalPlaces
  );

  const price =
    normalizedOrder &&
    getDerivedPrice(normalizedOrder, marketPrice ?? undefined);

  const notionalSize = getNotionalSize(
    price,
    normalizedOrder?.size,
    market.decimalPlaces,
    market.positionDecimalPlaces,
    asset.decimals
  );

  const { data: activeOrders } = useActiveOrders(pubKey, market.id);
  const { data: margin } = useDataProvider({
    dataProvider: marginModeDataProvider,
    variables: { partyId: pubKey || '', marketId: market.id },
    skip: !pubKey,
  });

  const { openVolume, averageEntryPrice } = useOpenVolume(
    pubKey,
    market.id
  ) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };
  const orders = activeOrders
    ? activeOrders.map<Schema.OrderInfo>((order) => ({
        isMarketOrder: order.type === Schema.OrderType.TYPE_MARKET,
        price: order.price,
        remaining: order.remaining,
        side: order.side,
      }))
    : [];
  if (normalizedOrder) {
    orders.push({
      isMarketOrder: normalizedOrder.type === Schema.OrderType.TYPE_MARKET,
      price: normalizedOrder.price ?? '0',
      remaining: normalizedOrder.size,
      side: normalizedOrder.side,
    });
  }

  const positionEstimate = usePositionEstimate(
    {
      marketId: market.id,
      openVolume,
      averageEntryPrice,
      orders,
      marginAccountBalance: marginAccountBalance || '0',
      generalAccountBalance: generalAccountBalance || '0',
      orderMarginAccountBalance: orderMarginAccountBalance || '0',
      marginFactor: margin?.marginFactor || '1',
      marginMode:
        margin?.marginMode || Schema.MarginMode.MARGIN_MODE_CROSS_MARGIN,
      includeRequiredPositionMarginInAvailableCollateral: true,
    },
    !normalizedOrder ||
      (normalizedOrder.type !== Schema.OrderType.TYPE_MARKET &&
        (!normalizedOrder.price || normalizedOrder.price === '0')) ||
      normalizedOrder.size === '0'
  );

  const slippage = useSlippage(normalizedOrder, market);
  const useBaseAsset = isSpotMarket && side === Schema.Side.SIDE_SELL;

  const summaryError = useMemo(() => {
    if (!pubKey) {
      return {
        message: t('No public key selected'),
        type: SummaryValidationType.NoPubKey,
      };
    }

    let marketStateError: true | string = true;

    if (
      [
        Schema.MarketState.STATE_SETTLED,
        Schema.MarketState.STATE_REJECTED,
        Schema.MarketState.STATE_TRADING_TERMINATED,
        Schema.MarketState.STATE_CANCELLED,
        Schema.MarketState.STATE_CLOSED,
      ].includes(marketState)
    ) {
      marketStateError = t(
        `This market is {{marketState}} and not accepting orders`,
        {
          marketState:
            marketState === Schema.MarketState.STATE_TRADING_TERMINATED
              ? t('terminated')
              : t(Schema.MarketStateMapping[marketState]).toLowerCase(),
        }
      );
    }

    if (marketStateError !== true) {
      return {
        message: marketStateError,
        type: SummaryValidationType.MarketState,
      };
    }

    const availableAmount = useBaseAsset
      ? baseAssetAccountBalance
      : generalAccountBalance;
    const hasNoBalance =
      !BigInt(availableAmount) &&
      !BigInt(marginAccountBalance) &&
      !BigInt(orderMarginAccountBalance);
    if (
      hasNoBalance &&
      !(
        loadingMarginAccountBalance ||
        (useBaseAsset ? loadingBaseAssetAccount : loadingGeneralAccountBalance)
      )
    ) {
      return {
        message: SummaryValidationType.NoCollateral,
        type: SummaryValidationType.NoCollateral,
      };
    }

    // Check you have enough collateral to make a spot trade
    if (isSpotMarket && baseAsset) {
      if (useBaseAsset) {
        const available = toBigNum(baseAssetAccountBalance, baseAsset.decimals);
        if (available.isLessThan(rawSize || '0')) {
          return {
            message: SummaryValidationType.NotEnoughCollateral,
            type: SummaryValidationType.NotEnoughCollateral,
          };
        }
      } else {
        const available = toBigNum(availableAmount, quoteAsset.decimals);
        if (available.isLessThan(notional || '0')) {
          return {
            message: SummaryValidationType.NotEnoughCollateral,
            type: SummaryValidationType.NotEnoughCollateral,
          };
        }
      }
    }

    const marketTradingModeError = validateMarketTradingMode(
      marketTradingMode,
      t('No trading')
    );

    if (marketTradingModeError !== true) {
      return {
        message: marketTradingModeError,
        type: SummaryValidationType.TradingMode,
      };
    }

    return undefined;
  }, [
    t,
    marketState,
    marketTradingMode,
    generalAccountBalance,
    marginAccountBalance,
    baseAssetAccountBalance,
    orderMarginAccountBalance,
    loadingMarginAccountBalance,
    loadingGeneralAccountBalance,
    loadingBaseAssetAccount,
    pubKey,
    useBaseAsset,
    notional,
    isSpotMarket,
    baseAsset,
    quoteAsset,
    rawSize,
  ]);

  const nonPersistentOrder = isNonPersistentOrder(timeInForce);
  const enablePostOnly = !nonPersistentOrder;
  const enableReduceOnly = nonPersistentOrder;
  const enableIceberg = !nonPersistentOrder;
  const featureFlags = useFeatureFlags((state) => state.flags);
  const sizeStep = determineSizeStep(market);
  const notionalPrice = !price || price === '0' ? marketPrice : price;
  const minNotional = notionalPrice
    ? toBigNum(notionalPrice, market.decimalPlaces)
        .multipliedBy(sizeStep)
        .toNumber()
    : undefined;

  const notionalDecimals =
    minNotional && Math.floor(Math.log10(minNotional)) * -1;
  const notionalStep = notionalDecimals ? toDecimal(notionalDecimals) : '1';

  const sliderUsed = useRef(false);
  useEffect(() => {
    if (!notionalPrice || typeof notionalDecimals !== 'number') {
      return;
    }
    if (useNotional && !sliderUsed.current) {
      let size = '0';
      if (notional && notional !== '0') {
        const s = BigNumber(notional).dividedBy(
          toBigNum(notionalPrice, market.decimalPlaces)
        );
        if (market.positionDecimalPlaces >= 0) {
          size = s.toFixed(market.positionDecimalPlaces);
        } else {
          const p = market.positionDecimalPlaces * -1;
          size = `${s.dividedBy(Math.pow(10, p)).toFixed(0)}${''.padEnd(
            p,
            '0'
          )}`;
        }
      }
      setValue('size', size);
    } else {
      const notional =
        !rawSize || rawSize === '0'
          ? '0'
          : BigNumber(rawSize)
              .multipliedBy(toBigNum(notionalPrice, market.decimalPlaces))
              .toFixed(Math.max(notionalDecimals, 0));
      setValue('notional', notional);
    }
    sliderUsed.current = false;
  }, [
    market.decimalPlaces,
    market.positionDecimalPlaces,
    notional,
    notionalPrice,
    rawSize,
    setValue,
    useNotional,
    notionalDecimals,
  ]);

  const marketIsInAuction = isMarketInAuction(marketData.marketTradingMode);

  const maxSize = useMaxSize({
    accountDecimals: accountDecimals ?? undefined,
    activeOrders: activeOrders ?? undefined,
    decimalPlaces: market.decimalPlaces,
    baseAssetAccountBalance,
    baseAssetDecimals: baseAssetDecimals ?? undefined,
    marginAccountBalance,
    orderMarginAccountBalance,
    marginFactor: margin?.marginFactor,
    marginMode: margin?.marginMode,
    markPrice: markPrice ?? undefined,
    price,
    riskFactors,
    scalingFactors,
    side,
    type,
    generalAccountBalance,
    openVolume,
    positionDecimalPlaces: market.positionDecimalPlaces,
    marketIsInAuction,
    isSpotMarket,
    feesFactors: market.fees.factors,
  });

  const onSubmit = useCallback(
    (formValues: OrderFormValues) => {
      const now = new Date().getTime();
      if (lastSubmitTime.current && now - lastSubmitTime.current < 1000) {
        return;
      }
      if (
        featureFlags.TAKE_PROFIT_STOP_LOSS &&
        formValues.tpSl &&
        (formValues.takeProfit || formValues.stopLoss)
      ) {
        const reference = `${pubKey}-${now}-${uniqueId()}`;
        const batchMarketInstructions = mapFormValuesToTakeProfitAndStopLoss(
          formValues,
          market,
          reference
        );
        submit({
          batchMarketInstructions,
        });
      } else {
        const orderSubmission = mapFormValuesToOrderSubmission(
          formValues,
          market.id,
          market.decimalPlaces,
          market.positionDecimalPlaces
        );
        submit({ orderSubmission });
      }
      lastSubmitTime.current = now;
    },
    [featureFlags.TAKE_PROFIT_STOP_LOSS, market, pubKey, submit]
  );
  useController({
    name: 'type',
    control,
    rules: {
      validate: validateType(marketData.marketTradingMode, marketData.trigger),
    },
  });

  const priceStep = determinePriceStep(market);

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
      <FormGroup label={t('Order side')} labelFor="side" hideLabel compact>
        <Controller
          name="side"
          control={control}
          render={({ field }) => (
            <SideSelector
              isSpotMarket={isSpotMarket}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      </FormGroup>
      <FormGroup label={t('Order type')} labelFor="type" hideLabel>
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
      </FormGroup>
      {isLimitType && (
        <FormGroup labelFor="input-price-quote" label={t('Price')} hideLabel>
          <Controller
            name="price"
            control={control}
            rules={{
              required: t('You need to provide a price'),
              min: {
                value: priceStep,
                message: t('Price cannot be lower than {{priceStep}}', {
                  priceStep,
                }),
              },
              validate: validateAmount(priceStep, 'Price'),
            }}
            render={({ field, fieldState }) => (
              <>
                <TicketInput
                  placeholder={t('Price')}
                  step={priceStep}
                  type="number"
                  data-testid="order-price"
                  id="input-price-quote"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  appendElement={
                    <PricePill
                      quoteAsset={quoteAsset}
                      baseAsset={baseAsset}
                      quoteName={quoteName}
                      isNotional={useNotional}
                      isSpotMarket={isSpotMarket}
                    />
                  }
                />
                {fieldState.error && (
                  <InputError testId="deal-ticket-error-message-price">
                    {fieldState.error.message}
                  </InputError>
                )}
              </>
            )}
          />
        </FormGroup>
      )}
      <div className="mb-4">
        {useNotional && (
          <Controller
            key="notional"
            name="notional"
            control={control}
            render={({ field }) => (
              <FormGroup
                label={t('Notional')}
                labelFor="order-notional"
                compact
                hideLabel
              >
                <TicketInput
                  placeholder={t('Notional')}
                  type="number"
                  data-testid="order-notional"
                  id="order-notional"
                  onWheel={(e) => e.currentTarget.blur()}
                  min={notionalStep}
                  step={notionalStep}
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  appendElement={
                    quoteName && (
                      <button
                        data-testid="useSize"
                        type="button"
                        onClick={() => setValue('useNotional', false)}
                      >
                        <Pill size="xs">
                          {isSpotMarket ? (
                            <AssetSymbol asset={quoteAsset} />
                          ) : (
                            quoteAsset.symbol
                          )}{' '}
                          <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
                        </Pill>
                      </button>
                    )
                  }
                />
              </FormGroup>
            )}
          />
        )}
        <Controller
          key="size"
          name="size"
          control={control}
          rules={{
            required: t('You need to provide a size'),
            min: {
              value: sizeStep,
              message: t('Size cannot be lower than {{sizeStep}}', {
                sizeStep,
              }),
            },
            validate: validateAmount(sizeStep, 'Size'),
            deps: ['peakSize', 'minimumVisibleSize'],
          }}
          render={({ field, fieldState }) => (
            <>
              {!useNotional && (
                <FormGroup
                  label={t('Size')}
                  labelFor="order-size"
                  compact
                  hideLabel
                >
                  <TicketInput
                    placeholder={t('Size')}
                    min={sizeStep}
                    step={sizeStep}
                    type="number"
                    data-testid="order-size"
                    id="order-size"
                    onWheel={(e) => e.currentTarget.blur()}
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    appendElement={
                      baseQuote && (
                        <button
                          data-testid="useNotional"
                          type="button"
                          onClick={() => setValue('useNotional', true)}
                        >
                          <Pill size="xs">
                            {baseAsset ? (
                              <AssetSymbol asset={baseAsset} />
                            ) : (
                              baseQuote
                            )}{' '}
                            <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
                          </Pill>
                        </button>
                      )
                    }
                  />
                </FormGroup>
              )}
              <Slider
                min={0}
                max={maxSize}
                step={Number(sizeStep)}
                value={[Number(field.value)]}
                onValueChange={([value]) => {
                  sliderUsed.current = true;
                  field.onChange(value.toString());
                }}
              />
              {fieldState.error && (
                <InputError testId="deal-ticket-error-message-size">
                  {fieldState.error.message}
                </InputError>
              )}
            </>
          )}
        />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex flex-col items-start gap-1.5">
          {featureFlags.TAKE_PROFIT_STOP_LOSS && (
            <Controller
              name="tpSl"
              control={control}
              render={({ field }) => (
                <Tooltip
                  description={
                    <p>{t('TP_SL_TOOLTIP', 'Take profit / Stop loss')}</p>
                  }
                  underline
                >
                  <div>
                    <Checkbox
                      name="tpSl"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={false}
                      label={t('TP / SL')}
                    />
                  </div>
                </Tooltip>
              )}
            />
          )}
          {enablePostOnly && (
            <Controller
              name="postOnly"
              control={control}
              render={({ field }) => (
                <Tooltip
                  description={
                    <>
                      <span>
                        {t(
                          '"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.'
                        )}
                      </span>{' '}
                      <ExternalLink href={DocsLinks?.POST_REDUCE_ONLY}>
                        {t('Find out more')}
                      </ExternalLink>
                    </>
                  }
                  underline
                >
                  <div>
                    <Checkbox
                      name="post-only"
                      checked={field.value}
                      onCheckedChange={(postOnly) => {
                        field.onChange(postOnly);
                        setValue('reduceOnly', false);
                      }}
                      label={t('Post only')}
                    />
                  </div>
                </Tooltip>
              )}
            />
          )}
          {enableReduceOnly && (
            <Controller
              name="reduceOnly"
              control={control}
              render={({ field }) => (
                <Tooltip
                  description={
                    <>
                      <span>{t(REDUCE_ONLY_TOOLTIP)}</span>{' '}
                      <ExternalLink href={DocsLinks?.POST_REDUCE_ONLY}>
                        {t('Find out more')}
                      </ExternalLink>
                    </>
                  }
                  underline
                >
                  <div>
                    <Checkbox
                      name="reduce-only"
                      checked={field.value}
                      onCheckedChange={(reduceOnly) => {
                        field.onChange(reduceOnly);
                        setValue('postOnly', false);
                      }}
                      label={t('Reduce only')}
                    />
                  </div>
                </Tooltip>
              )}
            />
          )}
          {enableIceberg && (
            <Controller
              name="iceberg"
              control={control}
              render={({ field }) => (
                <Tooltip
                  description={
                    <p>
                      {t(
                        'ICEBERG_TOOLTIP',
                        'Trade only a fraction of the order size at once. After the peak size of the order has traded, the size is reset. This is repeated until the order is cancelled, expires, or its full volume trades away. For example, an iceberg order with a size of 1000 and a peak size of 100 will effectively be split into 10 orders with a size of 100 each. Note that the full volume of the order is not hidden and is still reflected in the order book.'
                      )}{' '}
                      <ExternalLink href={DocsLinks?.ICEBERG_ORDERS}>
                        {t('Find out more')}
                      </ExternalLink>{' '}
                    </p>
                  }
                  underline
                >
                  <div>
                    <Checkbox
                      name="iceberg"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      label={t('Iceberg')}
                    />
                  </div>
                </Tooltip>
              )}
            />
          )}
        </div>
        <div className="flex-1">
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
                onSelect={(value: Schema.OrderTimeInForce) => {
                  // If GTT is selected and no expiresAt time is set, or its
                  // behind current time then reset the value to current time
                  const now = Date.now();
                  if (
                    value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
                    (!expiresAt || new Date(expiresAt).getTime() < now)
                  ) {
                    setValue('expiresAt', formatForInput(new Date(now)), {
                      shouldValidate: true,
                    });
                  }

                  // iceberg orders must be persistent orders, so if user
                  // switches to a non persistent tif value, remove iceberg selection
                  if (iceberg && isNonPersistentOrder(value)) {
                    setValue('iceberg', false);
                  }
                  field.onChange(value);
                }}
              />
            )}
          />
        </div>
      </div>

      <TimeInForceError
        market={market}
        marketData={marketData}
        errorMessage={errors.timeInForce?.message}
      />

      {isLimitType &&
        timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiresAt"
            control={control}
            rules={{
              required: t('You need to provide a expiry time/date'),
              validate: validateExpiration(
                t(
                  'The expiry date that you have entered appears to be in the past'
                )
              ),
            }}
            render={({ field }) => (
              <FormGroup label={t('Expiry time/date')} labelFor="expiresAt">
                <ExpirySelector
                  value={field.value}
                  onSelect={(expiresAt) => field.onChange(expiresAt)}
                  errorMessage={errors.expiresAt?.message}
                />
              </FormGroup>
            )}
          />
        )}

      {featureFlags.TAKE_PROFIT_STOP_LOSS && tpSl && (
        <DealTicketPriceTakeProfitStopLoss
          market={market}
          takeProfitError={errors.takeProfit?.message}
          stopLossError={errors.stopLoss?.message}
          control={control}
          quoteName={quoteName}
        />
      )}

      {isLimitType && iceberg && (
        <DealTicketSizeIceberg
          market={market}
          peakSizeError={errors.peakSize?.message}
          minimumVisibleSizeError={errors.minimumVisibleSize?.message}
          control={control}
          size={rawSize}
          peakSize={peakSize}
        />
      )}

      <SummaryMessage
        error={summaryError}
        asset={(useBaseAsset && baseAsset) || asset}
        baseAsset={baseAsset}
        marketTradingMode={marketData.marketTradingMode}
        balance={useBaseAsset ? baseAssetAccountBalance : generalAccountBalance}
        isSpotMarket={isSpotMarket}
        margin={
          positionEstimate?.estimatePosition?.collateralIncreaseEstimate
            .bestCase || '0'
        }
        isReadOnly={isReadOnly}
        pubKey={pubKey}
        onDeposit={onDeposit}
        type={type}
      />
      <PlaceOrderButton
        isSpotMarket={isSpotMarket}
        type={type}
        side={side}
        baseQuote={baseQuote}
        quoteName={quoteName}
        market={market}
        normalizedOrder={normalizedOrder}
        baseAsset={baseAsset}
        quoteAsset={quoteAsset}
      />
      <div className="mt-2 mb-1 flex w-full flex-col gap-1">
        {useNotional ? (
          <KeyValue
            label={t('Size')}
            formattedValue={formatValue(
              normalizedOrder?.size || '0',
              market.positionDecimalPlaces
            )}
            value={formatValue(
              normalizedOrder?.size || '0',
              market.positionDecimalPlaces
            )}
            symbol={
              isSpotMarket && baseAsset ? getAssetSymbol(baseAsset) : baseQuote
            }
          />
        ) : (
          <KeyValue
            label={t('Notional')}
            formattedValue={formatValue(
              notionalSize,
              asset.decimals,
              asset.quantum
            )}
            value={formatValue(notionalSize, asset.decimals)}
            symbol={isSpotMarket ? getAssetSymbol(quoteAsset) : quoteName}
            labelDescription={t(
              'NOTIONAL_SIZE_TOOLTIP_TEXT',
              NOTIONAL_SIZE_TOOLTIP_TEXT,
              { quoteName }
            )}
          />
        )}
        <DealTicketFeeDetails
          order={
            normalizedOrder && { ...normalizedOrder, price: price || undefined }
          }
          assetSymbol={isSpotMarket ? getAssetSymbol(quoteAsset) : assetSymbol}
          market={market}
          marketIsInAuction={marketIsInAuction}
        />
      </div>
      <DealTicketMarginDetails
        side={normalizedOrder.side}
        asset={asset}
        marginAccountBalance={marginAccountBalance}
        orderMarginAccountBalance={orderMarginAccountBalance}
        generalAccountBalance={generalAccountBalance}
        positionEstimate={positionEstimate?.estimatePosition}
        market={market}
        slippage={slippage}
      />
    </form>
  );
};

/**
 * Renders an error message if errors.summary is present otherwise
 * renders warnings about current state of the market
 */
interface SummaryMessageProps {
  isSpotMarket?: boolean;
  error?: { message: string; type: string };
  asset: AssetFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  marketTradingMode: MarketData['marketTradingMode'];
  balance: string;
  margin: string;
  isReadOnly: boolean;
  pubKey: string | undefined;
  onDeposit: (assetId: string) => void;
  type: Schema.OrderType;
}

export const NoWalletWarning = ({
  isReadOnly,
  noWalletConnected,
}: Pick<SummaryMessageProps, 'isReadOnly'> & {
  noWalletConnected?: boolean;
}) => {
  const t = useT();
  if (noWalletConnected) {
    return (
      <div className="mb-2">
        <InputError testId="deal-ticket-error-message-summary">
          {t('You need a Vega wallet to start trading on this market')}
        </InputError>
      </div>
    );
  }
  if (isReadOnly) {
    return (
      <div className="mb-2">
        <InputError testId="deal-ticket-error-message-summary">
          {t(
            'You need to connect your own wallet to start trading on this market'
          )}
        </InputError>
      </div>
    );
  }
  return null;
};

const SummaryMessage = memo(
  ({
    isSpotMarket,
    error,
    asset,
    baseAsset,
    marketTradingMode,
    balance,
    margin,
    isReadOnly,
    pubKey,
    onDeposit,
    type,
  }: SummaryMessageProps) => {
    const t = useT();
    // Specific error UI for if balance is so we can
    // render a deposit dialog
    if (isReadOnly || !pubKey) {
      return <NoWalletWarning isReadOnly={isReadOnly} />;
    }

    if (error?.type === SummaryValidationType.NoCollateral) {
      if (isSpotMarket) {
        return (
          <div className="mb-2">
            <ZeroBalanceError
              asset={asset}
              baseAsset={baseAsset}
              onDeposit={onDeposit}
            />
          </div>
        );
      }
      return (
        <div className="mb-2">
          <ZeroBalanceError asset={asset} onDeposit={onDeposit} />
        </div>
      );
    }

    if (error?.type === SummaryValidationType.NotEnoughCollateral) {
      return (
        <div className="mb-2">
          <NotEnoughError asset={asset} onDeposit={onDeposit} />
        </div>
      );
    }

    // If we have any other full error which prevents
    // submission render that first
    if (error?.message) {
      return (
        <div className="mb-2">
          <InputError testId="deal-ticket-error-message-summary">
            {error?.message}
          </InputError>
        </div>
      );
    }

    // If there is no blocking error but user doesn't have enough
    // balance render the margin warning, but still allow submission
    if (
      !isSpotMarket &&
      BigInt(balance) < BigInt(margin) &&
      BigInt(balance) > BigInt(0)
    ) {
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
      if (type === Schema.OrderType.TYPE_MARKET) {
        return (
          <div className="mb-2">
            <Notification
              intent={Intent.Primary}
              testId={'deal-ticket-warning-auction'}
              message={t(
                'Market orders cannot be placed while in auction, click to switch to limit orders'
              )}
            />
          </div>
        );
      }
      return (
        <div className="mb-2">
          <Notification
            intent={Intent.Primary}
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

const PricePill = ({
  quoteAsset,
  baseAsset,
  quoteName,
  isSpotMarket,
  isNotional,
}: {
  quoteAsset: AssetFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  quoteName: string;
  isNotional?: boolean;
  isSpotMarket: boolean;
}) => {
  if (isSpotMarket) {
    if (isNotional) {
      return (
        <Pill size="xs">
          <AssetSymbol asset={baseAsset} />
        </Pill>
      );
    } else {
      return (
        <Pill size="xs">
          <AssetSymbol asset={quoteAsset} />
        </Pill>
      );
    }
  }

  return <Pill size="xs">{quoteName}</Pill>;
};

const PlaceOrderButton = ({
  isSpotMarket,
  side,
  type,
  baseQuote,
  quoteName,
  normalizedOrder,
  market,
  baseAsset,
  quoteAsset,
}: {
  isSpotMarket: boolean;
  type: Schema.OrderType;
  side: Schema.Side;
  baseQuote?: string;
  quoteName: string;
  normalizedOrder: OrderSubmission;
  market: Market;
  baseAsset?: AssetFieldsFragment;
  quoteAsset: AssetFieldsFragment;
}) => {
  const t = useT();

  const text = t(
    type === Schema.OrderType.TYPE_MARKET
      ? 'Place market order'
      : 'Place limit order'
  );

  const size = formatValue(normalizedOrder.size, market.positionDecimalPlaces);
  const price = formatValue(normalizedOrder.price, market.decimalPlaces);

  let baseText = `${size} ${baseQuote || ''}`;
  let quoteText = `${price} ${quoteName}`;

  if (isSpotMarket && baseAsset) {
    baseText = `${size} ${getAssetSymbol(baseAsset)}`;
    quoteText = `${price} ${getAssetSymbol(quoteAsset)}`;
  }

  if (type === Schema.OrderType.TYPE_MARKET) {
    quoteText = 'market';
  }

  const subLabel = `${baseText} @ ${quoteText}`;

  return <SubmitButton text={text} subLabel={subLabel} side={side} />;
};
