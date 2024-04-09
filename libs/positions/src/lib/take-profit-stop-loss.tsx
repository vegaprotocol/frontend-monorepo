import * as Schema from '@vegaprotocol/types';
import {
  TradingButton as Button,
  ButtonLink,
  FormGroup,
  TradingInput as Input,
  InputError,
  Intent,
  Pill,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  SizeOverrideSetting,
  isStopOrdersSubmissionTransaction,
  type StopOrderTakeProfitStopLossSetup,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
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
import classNames from 'classnames';

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
  allocation,
  averageEntryPrice,
  openVolume,
  create,
  market,
  side,
  triggerDirection,
  marketPrice,
}: {
  create: VegaTransactionStore['create'];
  market: Market;
  side: Schema.Side;
  triggerDirection: Schema.StopOrderTriggerDirection;
  averageEntryPrice?: string;
  openVolume?: string;
  allocation?: number;
  marketPrice: string | null;
}) => {
  const t = useT();
  const { handleSubmit, control, watch, setValue } = useForm<FormValues>();
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
    const stopOrderTakeProfitStopLossSetup: StopOrderTakeProfitStopLossSetup = {
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
      stopOrdersSubmission.risesAbove = stopOrderTakeProfitStopLossSetup;
    } else {
      stopOrdersSubmission.fallsBelow = stopOrderTakeProfitStopLossSetup;
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
    const components = [
      <ProfitAndLoss
        averageEntryPrice={averageEntryPrice}
        openVolume={openVolume}
        decimalPlaces={market.decimalPlaces}
        exitPrice={removeDecimal(price, market.decimalPlaces)}
        positionDecimalPlaces={market.positionDecimalPlaces}
        size={(Number(size) / 100).toString()}
        decimals={asset.decimals}
        quantum={asset.quantum}
      />,
    ];
    const takeProfit =
      (side === Schema.Side.SIDE_SELL &&
        triggerDirection ===
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE) ||
      (side === Schema.Side.SIDE_BUY &&
        triggerDirection ===
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW);
    info = (
      <p className="text-xs mb-2" data-testId="summary-message">
        <Trans
          defaults={
            takeProfit
              ? side === Schema.Side.SIDE_SELL
                ? 'When the mark price rises above {{ price }} {{ symbol }} it will trigger a Take Profit order to close {{size}}% of this position for an estimated PNL of <0/> {{ symbol }}.'
                : 'When the mark price falls below {{ price }} {{ symbol }} it will trigger a Take Profit order to close {{size}}% of this position for an estimated PNL of <0/> {{ symbol }}.'
              : side === Schema.Side.SIDE_SELL
              ? 'When the mark price falls below {{ price }} {{ symbol }} it will trigger a Stop Loss order to close {{size}}% of this position with an estimated PNL of <0/> {{ symbol }}.'
              : 'When the mark price rises above {{ price }} {{ symbol }} it will trigger a Stop Loss order to close {{size}}% of this position with an estimated PNL of <0/> {{ symbol }}.'
          }
          values={values}
          components={components}
        />
      </p>
    );
  }

  const sizeStep = 0.1;
  const maxSize = 100 - (allocation ?? 0) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2 mb-2">
        <div className="w-1/2">
          <Controller
            name="price"
            control={control}
            rules={{
              required: t('You need provide a price'),
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
                      data-testId="price-input"
                      className="w-full"
                      min={priceStep}
                      step={priceStep}
                      appendElement={<Pill size="xs">{quoteName}</Pill>}
                      hasError={!!fieldState.error}
                      {...field}
                    />
                  </FormGroup>
                  {fieldState.error && (
                    <InputError testId="error-message-price">
                      {fieldState.error.message}
                    </InputError>
                  )}
                  {!fieldState.error && triggerWarning && (
                    <InputError
                      intent="warning"
                      testId="warning-message-trigger-price"
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
              required: t('You need to provide a size'),
              min: {
                value: sizeStep,
                message: t('Size cannot be lower than {{sizeStep}}', {
                  sizeStep,
                }),
              },
              validate: validateAmount(sizeStep, 'Size'),
            }}
            render={({ field, fieldState }) => (
              <>
                <FormGroup label={t('Quantity')} labelFor="size-input" compact>
                  <Input
                    id="size-input"
                    data-testId="size-input"
                    type="number"
                    className="w-full"
                    min={sizeStep}
                    max={maxSize}
                    step={sizeStep}
                    appendElement={
                      <>
                        <Pill size="xs">%</Pill>
                        <button
                          data-testId="use-max"
                          type="button"
                          className="flex ml-1"
                          onClick={() => setValue('size', maxSize.toString())}
                        >
                          <Pill size="xs" intent={Intent.Success}>
                            {t('Use Max')}
                          </Pill>
                        </button>
                      </>
                    }
                    hasError={!!fieldState.error}
                    {...field}
                  />
                </FormGroup>
                {fieldState.error && (
                  <InputError testId="error-message-size">
                    {fieldState.error.message}
                  </InputError>
                )}
              </>
            )}
          />
        </div>
      </div>
      {info}
      <Button
        disabled={!!transaction}
        className="w-full"
        type="submit"
        data-testid="submit-tpsl"
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

const StopOrder = ({
  stopOrder,
  market,
  create,
  averageEntryPrice,
  openVolume,
}: {
  stopOrder: StopOrderFieldsFragment;
  market: Market;
  create: VegaTransactionStore['create'];
  averageEntryPrice?: string;
  openVolume?: string;
}) => {
  const asset = getAsset(market);
  const symbol = getQuoteName(market);
  const price = (stopOrder.trigger as Schema.StopOrderPrice).price;
  const t = useT();
  return (
    <div
      className="flex justify-between text-xs items-center gap-3 px-3 py-1.5 dark:bg-vega-cdark-800 bg-vega-clight-800 mb-0.5"
      data-testId="stop-order"
    >
      <span>
        <Trans
          i18nKey={'tpSlOrder'}
          defaults={
            'Reduce {{value}}% at {{price}} {{symbol}} for estimated PnL of <0/> {{symbol}}'
          }
          values={{
            value: (Number(stopOrder.sizeOverrideValue) * 100).toFixed(),
            price:
              price && addDecimalsFormatNumber(price, market.decimalPlaces),
            symbol,
          }}
          components={[
            <ProfitAndLoss
              averageEntryPrice={averageEntryPrice}
              openVolume={openVolume}
              decimalPlaces={market.decimalPlaces}
              exitPrice={price || '0'}
              positionDecimalPlaces={market.positionDecimalPlaces}
              size={stopOrder.sizeOverrideValue || '0'}
              decimals={asset.decimals}
              quantum={asset.quantum}
            />,
          ]}
        />
      </span>
      <ButtonLink
        data-testId="cancel-stop-order"
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
  allocation,
  stopOrders,
  create,
  ...props
}: {
  stopOrders?: StopOrderFieldsFragment[];
  create: VegaTransactionStore['create'];
  allocation?: number;
  market: Market;
  averageEntryPrice?: string;
  openVolume?: string;
}) => {
  const t = useT();
  if (!stopOrders?.length) {
    return null;
  }
  return (
    <div className="mb-3" data-testId="stop-orders-list">
      <div className="flex justify-between text-xs px-3 pb-1.5">
        <span data-testId="allocation">
          {t('Allocation: {{percentage}}%', {
            percentage: ((allocation ?? 0) * 100).toFixed(),
          })}
        </span>
        <ButtonLink
          data-testid="cancel-all"
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
      </div>
      {stopOrders?.map((stopOrder) => (
        <StopOrder stopOrder={stopOrder} create={create} {...props} />
      ))}
    </div>
  );
};

const filterAndSort = (
  stopOrders: StopOrderFieldsFragment[] | null,
  triggerDirection: Schema.StopOrderTriggerDirection,
  order: 'asc' | 'desc'
) =>
  orderBy(
    stopOrders?.filter(
      (order) =>
        order.sizeOverrideSetting ===
          Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION &&
        order.triggerDirection === triggerDirection
    ),
    (stopOrder) => BigInt((stopOrder.trigger as Schema.StopOrderPrice).price),
    order
  );

const getAllocation = (stopOrders: StopOrderFieldsFragment[] | undefined) =>
  stopOrders?.reduce((allocation, stopOrder) => {
    return allocation + (Number(stopOrder.sizeOverrideValue) || 0);
  }, 0) || 0;

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
    side === Schema.Side.SIDE_SELL ? 'asc' : 'desc'
  );

  const takeProfitAllocation = getAllocation(takeProfitStopOrders);

  const stopLossStopOrders = filterAndSort(
    activeStopOrders,
    stopLossTrigger,
    side === Schema.Side.SIDE_SELL ? 'desc' : 'asc'
  );

  const stopLossAllocation = getAllocation(stopLossStopOrders);

  const { data: markPrice } = useMarkPrice(marketId);

  const t = useT();

  return (
    <>
      <dl className="mb-6 grid grid-cols-2 gap-1 font-alpha text-vega-clight-50 dark:text-vega-cdark-50">
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Symbol')}
        </dt>
        <dd className="text-right" data-testId="instrument-code">
          {market?.tradableInstrument.instrument.code}
        </dd>
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Position')}
        </dt>
        <dd
          data-testId="open-volume"
          className={classNames(
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
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Entry price')}
        </dt>
        <dd className="text-right" data-testId="average-entry-price">
          {openVolume?.averageEntryPrice &&
            market &&
            `${addDecimalsFormatNumber(
              openVolume.averageEntryPrice,
              market?.decimalPlaces
            )} ${quoteName}`}
        </dd>
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Mark price')}
        </dt>
        <dd className="text-right" data-testId="mark-price">
          {markPrice &&
            market &&
            `${addDecimalsFormatNumber(
              markPrice,
              market?.decimalPlaces
            )} ${quoteName}`}
        </dd>
      </dl>
      <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-6" />
      <div className="mb-1">{t('Take profit')}</div>
      <div className="mb-6" data-testId="take-profit">
        {market && (
          <StopOrdersList
            allocation={takeProfitAllocation}
            stopOrders={takeProfitStopOrders}
            create={create}
            market={market}
            openVolume={openVolume?.openVolume}
            averageEntryPrice={openVolume?.averageEntryPrice}
          />
        )}
        {takeProfitAllocation === 1 ? null : visibleForm !== 'tp' ? (
          <Button
            className="w-full"
            type="button"
            data-testid="add-take-profit"
            onClick={() => setVisibleForm('tp')}
          >
            {t('Add TP')}
          </Button>
        ) : (
          market && (
            <TakeProfitStopLossSetup
              allocation={takeProfitAllocation}
              create={create}
              market={market}
              marketPrice={markPrice}
              side={side}
              triggerDirection={takeProfitTrigger}
              openVolume={openVolume?.openVolume}
              averageEntryPrice={openVolume?.averageEntryPrice}
            />
          )
        )}
      </div>
      <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-6" />
      <div className="mb-1">{t('Stop loss')}</div>
      <div className="mb-6" data-testId="stop-loss">
        {market && (
          <StopOrdersList
            allocation={stopLossAllocation}
            stopOrders={stopLossStopOrders}
            create={create}
            market={market}
            openVolume={openVolume?.openVolume}
            averageEntryPrice={openVolume?.averageEntryPrice}
          />
        )}
        {stopLossAllocation === 1 ? null : visibleForm !== 'sl' ? (
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
              allocation={stopLossAllocation}
              create={create}
              market={market}
              marketPrice={markPrice}
              side={side}
              triggerDirection={stopLossTrigger}
              openVolume={openVolume?.openVolume}
              averageEntryPrice={openVolume?.averageEntryPrice}
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
