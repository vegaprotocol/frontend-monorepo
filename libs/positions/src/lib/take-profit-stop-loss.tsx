import * as Schema from '@vegaprotocol/types';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Intent,
  Notification,
  Pill,
  VegaIcon,
  VegaIconNames,
  ButtonLink,
} from '@vegaprotocol/ui-toolkit';
import {
  SizeOverrideSetting,
  isStopOrdersSubmissionTransaction,
  type StopOrderSetup,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useNetworkParamQuery } from '@vegaprotocol/network-parameters';
import {
  type VegaTransactionStore,
  useVegaTransactionStore,
  VegaTxStatus,
} from '@vegaprotocol/web3';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { type ReactNode, useState } from 'react';

import { useOpenVolume } from './use-open-volume';
import {
  type StopOrderFieldsFragment,
  useActiveStopOrders,
} from '@vegaprotocol/orders';
import orderBy from 'lodash/orderBy';

import {
  addDecimalsFormatNumber,
  determinePriceStep,
  formatNumber,
  getFormatDecimalsFromQuantum,
  removeDecimal,
  toBigNum,
  useValidateAmount,
  validateAgainstStep,
  volumePrefix,
} from '@vegaprotocol/utils';
import {
  type Market,
  useMarkPrice,
  useMarket,
  getQuoteName,
  getAsset,
} from '@vegaprotocol/markets';
import { useT } from '../use-t';
import { signedNumberCssClass } from '@vegaprotocol/datagrid';
import { Trans } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';

interface TakeProfitStopLossDialogProps {
  open: boolean;
  onClose: () => void;
  marketId: string;
  create: VegaTransactionStore['create'];
}

const ProfitAndLoss = ({
  averageEntryPrice,
  exitPrice,
  openVolume,
  size,
  decimalPlaces,
  positionDecimalPlaces,
  decimals,
  quantum,
}: {
  averageEntryPrice?: string;
  exitPrice: string;
  openVolume?: string;
  size: string;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  decimals: number;
  quantum: string;
}) => {
  const profitAndLoss = toBigNum(exitPrice || 0, decimalPlaces)
    .minus(toBigNum(averageEntryPrice || 0, decimalPlaces))
    .multipliedBy(toBigNum(openVolume || 0, positionDecimalPlaces))
    .multipliedBy(size);

  return profitAndLoss.isNaN() ? (
    '-'
  ) : (
    <span className={signedNumberCssClass(profitAndLoss.toNumber())}>
      {formatNumber(
        profitAndLoss,
        getFormatDecimalsFromQuantum(decimals, quantum)
      )}
    </span>
  );
};

interface FormValues {
  size: string;
  price: string;
}

const usePendingTransaction = (
  marketId: string,
  triggerDirection: Schema.StopOrderTriggerDirection
) =>
  useVegaTransactionStore((state) => state.transactions).find((transaction) => {
    if (
      !transaction ||
      ![VegaTxStatus.Requested, VegaTxStatus.Pending].includes(
        transaction.status
      ) ||
      !isStopOrdersSubmissionTransaction(transaction?.body)
    ) {
      return false;
    }
    const stopOrderSetup =
      transaction.body.stopOrdersSubmission[
        triggerDirection ===
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
          ? 'risesAbove'
          : 'fallsBelow'
      ];
    if (
      !stopOrderSetup ||
      stopOrderSetup.orderSubmission.marketId !== marketId ||
      stopOrderSetup.sizeOverrideSetting !==
        SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
    ) {
      return false;
    }
    return true;
  });

export const TakeProfitStopLossSetup = ({
  averageEntryPrice,
  openVolume,
  create,
  market,
  side,
  triggerDirection,
  marketPrice,
  numberOfActiveStopOrders,
  activeStopOrders,
}: {
  create: VegaTransactionStore['create'];
  market: Market;
  side: Schema.Side;
  triggerDirection: Schema.StopOrderTriggerDirection;
  averageEntryPrice?: string;
  openVolume?: string;
  marketPrice?: string;
  numberOfActiveStopOrders: number;
  activeStopOrders: StopOrderFieldsFragment[] | undefined;
}) => {
  const t = useT();
  const maxNumberOfOrders = useNetworkParamQuery({
    variables: {
      key: 'spam.protection.max.stopOrdersPerMarket',
    },
  }).data?.networkParameter?.value;
  const { handleSubmit, control, watch } = useForm<FormValues>();
  const price = watch('price');
  const size = watch('size');
  const validateAmount = useValidateAmount();
  const priceStep = determinePriceStep(market);
  const quoteName = getQuoteName(market);
  const transaction = usePendingTransaction(market.id, triggerDirection);
  const onSubmit = (values: FormValues) => {
    if (transaction) {
      return;
    }
    const stopOrdersSubmission: StopOrdersSubmission = {
      risesAbove: undefined,
      fallsBelow: undefined,
    };
    const stopOrderSetup: StopOrderSetup = {
      sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
      sizeOverrideValue: { percentage: (Number(values.size) / 100).toString() },
      price: removeDecimal(values.price, market.decimalPlaces),
      orderSubmission: {
        marketId: market.id,
        reduceOnly: true,
        side,
        size: '1',
        type: Schema.OrderType.TYPE_MARKET,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
    };
    if (
      triggerDirection ===
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
    ) {
      stopOrdersSubmission.risesAbove = stopOrderSetup;
    } else {
      stopOrdersSubmission.fallsBelow = stopOrderSetup;
    }
    create({
      stopOrdersSubmission,
    });
  };

  let info: ReactNode = null;
  if (averageEntryPrice && openVolume && price && size) {
    const asset = getAsset(market);
    const values = {
      size,
      price,
      symbol: quoteName,
    };
    const precedingStopOrders = activeStopOrders?.filter((stopOrder) => {
      const trigger = getTriggerPrice(stopOrder, marketPrice);
      if (!trigger) {
        return false;
      }
      const triggerPrice = toBigNum(trigger, market.decimalPlaces);
      return triggerDirection ===
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
        ? triggerPrice.isLessThanOrEqualTo(price)
        : triggerPrice.isGreaterThanOrEqualTo(price);
    });
    const remainingOpenVolume = getRemainingOpenVolume(
      precedingStopOrders,
      openVolume
    );
    const components = [
      <ProfitAndLoss
        averageEntryPrice={averageEntryPrice}
        openVolume={remainingOpenVolume}
        decimalPlaces={market.decimalPlaces}
        exitPrice={removeDecimal(price, market.decimalPlaces)}
        positionDecimalPlaces={market.positionDecimalPlaces}
        size={(Number(size) / 100).toString()}
        decimals={asset.decimals}
        quantum={asset.quantum}
      />,
    ];
    info = (
      <p className="text-xs mb-2" data-testid="summary-message">
        <Trans
          defaults={
            triggerDirection ===
            Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
              ? 'When the mark price rises above {{ price }} {{ symbol }} it will trigger an order to reduce {{size}}% of remaining position for an estimated PNL of <0/> {{ symbol }}.'
              : 'When the mark price falls below {{ price }} {{ symbol }} it will trigger an order to reduce {{size}}% of remaining position for an estimated PNL of <0/> {{ symbol }}.'
          }
          values={values}
          components={components}
        />
      </p>
    );
  }

  const sizeStep = 1;
  const maxSize = 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate data-testid="setup-form">
      <div className="flex gap-2 mb-2 clear-both">
        <div className="w-1/2">
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
            render={({ field, fieldState }) => {
              let triggerWarning = false;
              if (marketPrice && field.value) {
                const condition =
                  triggerDirection ===
                  Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
                    ? '>'
                    : '<';
                const diff =
                  BigInt(marketPrice) -
                  BigInt(removeDecimal(field.value, market.decimalPlaces));
                if (
                  (condition === '>' && diff > 0) ||
                  (condition === '<' && diff < 0)
                ) {
                  triggerWarning = true;
                }
              }
              return (
                <>
                  <FormGroup label={t('Price')} labelFor="price-input" compact>
                    <Input
                      type="number"
                      id="price-input"
                      data-testid="price-input"
                      className="w-full"
                      min={priceStep}
                      step={priceStep}
                      appendElement={<Pill size="xs">{quoteName}</Pill>}
                      hasError={!!fieldState.error}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormGroup>
                  {fieldState.error && (
                    <InputError testId="price-error-message">
                      {fieldState.error.message}
                    </InputError>
                  )}
                  {!fieldState.error && triggerWarning && (
                    <InputError
                      intent="warning"
                      testId="price-trigger-warning-message"
                    >
                      {t('Stop order will be triggered immediately')}
                    </InputError>
                  )}
                </>
              );
            }}
          />
        </div>
        <div className="w-1/2">
          <Controller
            name={'size'}
            control={control}
            rules={{
              required: t('You need to provide a quantity'),
              min: {
                value: sizeStep,
                message: t('Quantity cannot be lower than {{sizeStep}}', {
                  sizeStep,
                }),
              },
              max: {
                value: maxSize,
                message: t('Quantity cannot be greater than {{maxSize}}', {
                  maxSize,
                }),
              },
              validate: (value?: string) => {
                const isValid = value
                  ? validateAgainstStep(sizeStep, value)
                  : true;
                if (!isValid) {
                  return t('Quantity must be whole numbers');
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <>
                <FormGroup label={t('Quantity')} labelFor="size-input" compact>
                  <Input
                    id="size-input"
                    data-testid="size-input"
                    type="number"
                    className="w-full"
                    min={sizeStep}
                    max={maxSize}
                    step={sizeStep}
                    appendElement={<Pill size="xs">%</Pill>}
                    hasError={!!fieldState.error}
                    {...field}
                    value={field.value || ''}
                  />
                </FormGroup>
                {fieldState.error && (
                  <InputError testId="size-error-message">
                    {fieldState.error.message}
                  </InputError>
                )}
              </>
            )}
          />
        </div>
      </div>
      {info}
      {maxNumberOfOrders &&
      numberOfActiveStopOrders >= Number(maxNumberOfOrders) ? (
        <div className="mb-2">
          <Notification
            intent={Intent.Warning}
            testId={'stop-order-limit-warning'}
            message={t(
              'There is a limit of {{maxNumberOfOrders}} active stop orders per market. Orders submitted above the limit will be immediately rejected.',
              {
                maxNumberOfOrders,
              }
            )}
          />
        </div>
      ) : null}
      <Button
        disabled={!!transaction}
        className="w-full"
        type="submit"
        data-testid="submit"
      >
        {transaction
          ? transaction.status === VegaTxStatus.Requested
            ? t('Action required')
            : t('Awaiting confirmation')
          : t('Confirm')}
      </Button>
    </form>
  );
};

const getTriggerPrice = (
  stopOrder: StopOrderFieldsFragment,
  marketPrice?: string
) => {
  let price: string | undefined = undefined;
  if (stopOrder.trigger.__typename === 'StopOrderPrice') {
    price = stopOrder.trigger.price;
  } else if (
    stopOrder.trigger.__typename === 'StopOrderTrailingPercentOffset' &&
    marketPrice
  ) {
    price = BigNumber(marketPrice)
      .multipliedBy(
        stopOrder.triggerDirection ===
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
          ? 1 - Number(stopOrder.trigger.trailingPercentOffset)
          : 1 + Number(stopOrder.trigger.trailingPercentOffset)
      )
      .toFixed(0);
  }
  return price;
};

const StopOrder = ({
  stopOrder,
  market,
  create,
  averageEntryPrice,
  openVolume,
  marketPrice,
}: {
  stopOrder: StopOrderFieldsFragment;
  market: Market;
  create: VegaTransactionStore['create'];
  averageEntryPrice?: string;
  openVolume?: string;
  marketPrice?: string;
}) => {
  const asset = getAsset(market);
  const symbol = getQuoteName(market);
  const triggerPrice = getTriggerPrice(stopOrder, marketPrice);
  const isLimitOrder =
    stopOrder.submission.type === Schema.OrderType.TYPE_LIMIT;
  const { price } = stopOrder.submission;
  const values = {
    value: (Number(stopOrder.sizeOverrideValue) * 100).toFixed(),
    triggerPrice:
      triggerPrice &&
      addDecimalsFormatNumber(triggerPrice, market.decimalPlaces),
    symbol,
    price: price && addDecimalsFormatNumber(price, market.decimalPlaces),
  };
  const t = useT();
  return (
    <div
      className="flex justify-between text-xs items-center gap-3 px-3 py-1.5  bg-surface-1 mb-0.5"
      data-testid="stop-order"
    >
      <span>
        <Trans
          i18nKey={isLimitOrder ? 'tpSlLimitOrder' : 'tpSlOrder'}
          defaults={
            isLimitOrder
              ? 'Reduce {{value}}% at {{price}} {{symbol}} (triggered at {{triggerPrice}} {{symbol}}) for estimated PnL of <0/> {{symbol}}'
              : 'Reduce {{value}}% at {{triggerPrice}} {{symbol}} for estimated PnL of <0/> {{symbol}}'
          }
          values={values}
          components={[
            <ProfitAndLoss
              averageEntryPrice={averageEntryPrice}
              openVolume={openVolume}
              decimalPlaces={market.decimalPlaces}
              exitPrice={(isLimitOrder ? price : triggerPrice) || '0'}
              positionDecimalPlaces={market.positionDecimalPlaces}
              size={stopOrder.sizeOverrideValue || '0'}
              decimals={asset.decimals}
              quantum={asset.quantum}
            />,
          ]}
        />
      </span>
      <ButtonLink
        data-testid="cancel-stop-order"
        onClick={() =>
          create({
            stopOrdersCancellation: {
              stopOrderId: stopOrder.id,
              marketId: market.id,
            },
          })
        }
        title={t('Cancel stop order')}
      >
        <VegaIcon name={VegaIconNames.CROSS} size={16} />
      </ButtonLink>
    </div>
  );
};

const StopOrdersList = ({
  stopOrders,
  create,
  openVolume,
  ...props
}: {
  stopOrders?: StopOrderFieldsFragment[];
  create: VegaTransactionStore['create'];
  market: Market;
  averageEntryPrice?: string;
  openVolume?: string;
  marketPrice?: string;
}) => {
  const t = useT();
  if (!stopOrders?.length) {
    return null;
  }
  let openVolumeLeft = toBigNum(openVolume ?? '0', 0);
  return (
    <div className="mb-3" data-testid="stop-orders-list">
      <ButtonLink
        data-testid="cancel-all"
        className="text-xs float-right mt-1"
        onClick={() =>
          create(
            stopOrders.length > 1
              ? {
                  batchMarketInstructions: {
                    stopOrdersCancellation: stopOrders?.map(
                      ({ id: stopOrderId }) => ({
                        stopOrderId,
                        marketId: props.market.id,
                      })
                    ),
                  },
                }
              : {
                  stopOrdersCancellation: {
                    stopOrderId: stopOrders[0].id,
                    marketId: props.market.id,
                  },
                }
          )
        }
        title={t('Cancel all')}
      >
        {t('Cancel all')}
      </ButtonLink>
      <div className="clear-both">
        {stopOrders?.map((stopOrder) => {
          const element = (
            <StopOrder
              stopOrder={stopOrder}
              create={create}
              {...props}
              key={stopOrder.id}
              openVolume={openVolumeLeft.toFixed()}
            />
          );
          openVolumeLeft = openVolumeLeft.multipliedBy(
            1 - Number(stopOrder.sizeOverrideValue ?? 0)
          );
          return element;
        })}
      </div>
    </div>
  );
};

const filterAndSort = (
  stopOrders: StopOrderFieldsFragment[] | null,
  triggerDirection: Schema.StopOrderTriggerDirection,
  order: 'asc' | 'desc',
  marketPrice?: string
) =>
  orderBy(
    stopOrders?.filter(
      (order) =>
        order.sizeOverrideSetting ===
          Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION &&
        order.triggerDirection === triggerDirection
    ),
    (stopOrder) => {
      const triggerPrice = getTriggerPrice(stopOrder, marketPrice);
      if (triggerPrice) {
        return BigInt(triggerPrice);
      }
      return BigInt(0);
    },
    order
  );

const getRemainingOpenVolume = (
  stopOrders: StopOrderFieldsFragment[] | undefined,
  openVolume: string | undefined
) =>
  toBigNum(openVolume || 0, 0)
    .multipliedBy(
      stopOrders?.reduce(
        (remaining, stopOrder) =>
          remaining * (1 - (Number(stopOrder.sizeOverrideValue) || 0)),
        1
      ) ?? 1
    )
    .toFixed();

export const TakeProfitStopLoss = ({
  marketId,
  create,
}: Pick<TakeProfitStopLossDialogProps, 'marketId' | 'create'>) => {
  const [visibleForm, setVisibleForm] = useState<'sl' | 'tp' | undefined>(
    undefined
  );
  const { data: market } = useMarket(marketId);
  const { pubKey } = useVegaWallet();
  const { data: activeStopOrders } = useActiveStopOrders(pubKey, marketId);
  const quoteName = market && getQuoteName(market);
  const openVolume = useOpenVolume(pubKey, marketId);
  const side = openVolume?.openVolume.startsWith('-')
    ? Schema.Side.SIDE_BUY
    : Schema.Side.SIDE_SELL;
  const { data: markPrice } = useMarkPrice(marketId);

  const takeProfitTrigger =
    side === Schema.Side.SIDE_SELL
      ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW;

  const stopLossTrigger =
    takeProfitTrigger ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW;

  const takeProfitStopOrders = filterAndSort(
    activeStopOrders,
    takeProfitTrigger,
    side === Schema.Side.SIDE_SELL ? 'asc' : 'desc',
    markPrice ?? undefined
  );

  const stopLossStopOrders = filterAndSort(
    activeStopOrders,
    stopLossTrigger,
    side === Schema.Side.SIDE_SELL ? 'desc' : 'asc',
    markPrice ?? undefined
  );
  const t = useT();

  return (
    <>
      <dl className="mb-6 grid grid-cols-2 gap-1 text-gs-50">
        <dt className="text-surface-1-fg ">{t('Symbol')}</dt>
        <dd className="text-right" data-testid="instrument-code">
          {market?.tradableInstrument.instrument.code}
        </dd>
        <dt className="text-surface-1-fg ">{t('Position')}</dt>
        <dd
          data-testid="open-volume"
          className={cn(
            'text-right',
            openVolume?.openVolume &&
              signedNumberCssClass(openVolume.openVolume)
          )}
        >
          {openVolume?.openVolume && market
            ? volumePrefix(
                addDecimalsFormatNumber(
                  openVolume.openVolume,
                  market.positionDecimalPlaces
                )
              )
            : '-'}
        </dd>
        <dt className="text-surface-1-fg ">{t('Entry price')}</dt>
        <dd className="text-right" data-testid="average-entry-price">
          {openVolume?.averageEntryPrice &&
            market &&
            `${addDecimalsFormatNumber(
              openVolume.averageEntryPrice,
              market?.decimalPlaces
            )} ${quoteName}`}
        </dd>
        <dt className="text-surface-1-fg ">{t('Mark price')}</dt>
        <dd className="text-right" data-testid="mark-price">
          {markPrice &&
            market &&
            `${addDecimalsFormatNumber(
              markPrice,
              market?.decimalPlaces
            )} ${quoteName}`}
        </dd>
      </dl>
      <hr className="border-gs-300 dark:border-gs-700 mb-6" />
      <div className="mb-1 float-left">{t('Take profit')}</div>
      <div className="mb-6" data-testid="take-profit">
        {market && (
          <StopOrdersList
            stopOrders={takeProfitStopOrders}
            create={create}
            market={market}
            openVolume={openVolume?.openVolume}
            averageEntryPrice={openVolume?.averageEntryPrice}
            marketPrice={markPrice ?? undefined}
          />
        )}
        {visibleForm !== 'tp' ? (
          <Button
            className="w-full clear-both"
            type="button"
            data-testid="add-take-profit"
            onClick={() => setVisibleForm('tp')}
          >
            {t('Add TP')}
          </Button>
        ) : (
          market && (
            <TakeProfitStopLossSetup
              create={create}
              market={market}
              marketPrice={markPrice ?? undefined}
              side={side}
              triggerDirection={takeProfitTrigger}
              openVolume={openVolume?.openVolume}
              activeStopOrders={takeProfitStopOrders}
              averageEntryPrice={openVolume?.averageEntryPrice}
              numberOfActiveStopOrders={activeStopOrders?.length ?? 0}
            />
          )
        )}
      </div>
      <hr className="border-gs-300 dark:border-gs-700 mb-6" />
      <div className="mb-1">{t('Stop loss')}</div>
      <div className="mb-6" data-testid="stop-loss">
        {market && (
          <StopOrdersList
            stopOrders={stopLossStopOrders}
            create={create}
            market={market}
            openVolume={openVolume?.openVolume}
            averageEntryPrice={openVolume?.averageEntryPrice}
            marketPrice={markPrice ?? undefined}
          />
        )}
        {visibleForm !== 'sl' ? (
          <Button
            className="w-full"
            type="button"
            data-testid="add-stop-loss"
            onClick={() => setVisibleForm('sl')}
          >
            {t('Add SL')}
          </Button>
        ) : (
          market && (
            <TakeProfitStopLossSetup
              create={create}
              market={market}
              marketPrice={markPrice ?? undefined}
              side={side}
              triggerDirection={stopLossTrigger}
              openVolume={openVolume?.openVolume}
              activeStopOrders={stopLossStopOrders}
              averageEntryPrice={openVolume?.averageEntryPrice}
              numberOfActiveStopOrders={activeStopOrders?.length ?? 0}
            />
          )
        )}
      </div>
    </>
  );
};

export const TakeProfitStopLossDialog = ({
  open,
  onClose,
  ...props
}: TakeProfitStopLossDialogProps) => {
  const t = useT();
  return (
    <Dialog
      title={t('Manage TP / SL for position')}
      size="small"
      open={open}
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <TakeProfitStopLoss {...props} />
    </Dialog>
  );
};
