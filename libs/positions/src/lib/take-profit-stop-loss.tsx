import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  TradingButton as Button,
  ButtonLink,
  TradingInput as Input,
  InputError,
  Pill,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  SizeOverrideSetting,
  isStopOrdersSubmissionTransaction,
  type StopOrderSetup,
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
  stopOrdersProvider,
} from '@vegaprotocol/orders';
import orderBy from 'lodash/orderBy';

import {
  addDecimalsFormatNumber,
  determinePriceStep,
  formatNumber,
  removeDecimal,
  toBigNum,
  useValidateAmount,
} from '@vegaprotocol/utils';
import {
  type Market,
  markPriceProvider,
  useMarket,
  getQuoteName,
} from '@vegaprotocol/markets';
import { useT } from '../use-t';
import { signedNumberCssClass } from '@vegaprotocol/datagrid';
import { Trans } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';

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
}: {
  averageEntryPrice?: string;
  exitPrice: string;
  openVolume?: string;
  size: string;
  decimalPlaces: number;
  positionDecimalPlaces: number;
}) => {
  const profitAndLoss = toBigNum(exitPrice || 0, decimalPlaces)
    .minus(toBigNum(averageEntryPrice || 0, decimalPlaces))
    .multipliedBy(toBigNum(openVolume || 0, positionDecimalPlaces))
    .multipliedBy(size);

  return profitAndLoss.isNaN() ? (
    '-'
  ) : (
    <span className={signedNumberCssClass(profitAndLoss.toNumber())}>
      {formatNumber(profitAndLoss)}
    </span>
  );
};

interface FormValues {
  size: string;
  price: string;
}

export const Setup = ({
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
  const { handleSubmit, control, watch } = useForm<FormValues>();
  const price = watch('price');
  const size = watch('size');
  const validateAmount = useValidateAmount();
  const priceStep = determinePriceStep(market);
  const quoteName = getQuoteName(market);
  const transaction = useVegaTransactionStore(
    (state) => state.transactions
  ).find((transaction) => {
    if (
      !transaction ||
      ![VegaTxStatus.Requested, VegaTxStatus.Pending].includes(
        transaction.status
      ) ||
      !isStopOrdersSubmissionTransaction(transaction?.body)
    ) {
      return false;
    }
    const setup =
      transaction.body.stopOrdersSubmission[
        triggerDirection ===
        Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
          ? 'risesAbove'
          : 'fallsBelow'
      ];
    if (
      !setup ||
      setup.sizeOverrideSetting !==
        SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
    ) {
      return false;
    }
    return true;
  });
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
    const values = {
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
      <p className="text-xs mb-2">
        <Trans
          i18nKey={takeProfit ? 'takeProfitSummary' : 'stopLossSummary'}
          defaults={
            takeProfit
              ? 'When the mark price rises above {{ price }} {{ symbol }} it will trigger a Take Profit order to close this position for an estimated profit of <0/> {{ symbol }}.'
              : 'When the mark price falls below {{ price }} {{ symbol }} it will trigger a Stop Loss order to close this position with an estimated loss of <0/> {{ symbol }}.'
          }
          values={values}
          components={components}
        />
      </p>
    );
  }

  const sizeStep = 0.1;

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
                  <Input
                    type="number"
                    id="price-input"
                    className="w-full"
                    min={priceStep}
                    step={priceStep}
                    appendElement={<Pill size="xs">{quoteName}</Pill>}
                    hasError={!!fieldState.error}
                    {...field}
                  />
                  {fieldState.error && (
                    <InputError testId="tpsl-error-message-price">
                      {fieldState.error.message}
                    </InputError>
                  )}
                  {!fieldState.error && triggerWarning && (
                    <InputError
                      intent="warning"
                      testId="tpsl-warning-message-trigger-price"
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
                <Input
                  type="number"
                  className="w-full"
                  min={sizeStep}
                  max={100 - (allocation ?? 0) * 100}
                  step={sizeStep}
                  appendElement={<Pill size="xs">%</Pill>}
                  hasError={!!fieldState.error}
                  {...field}
                />
                {fieldState.error && (
                  <InputError testId="tpsl-error-message-size">
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
  const symbol = getQuoteName(market);
  const price = (stopOrder.trigger as Schema.StopOrderPrice).price;
  const t = useT();
  return (
    <div className="flex justify-between text-xs items-center gap-3 px-3 py-1.5 dark:bg-vega-cdark-800 bg-vega-clight-800 mb-0.5">
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
        title={t('Close position')}
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
    <div className="mb-3">
      <div className="flex justify-between text-xs px-3 pb-1.5">
        <span>
          {t('Allocation: {{percentage}}%', {
            percentage: (allocation * 100).toFixed(),
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
        /*order.sizeOverrideSetting ===
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION &&*/
        (order.sizeOverrideValue = '0.1') &&
        order.triggerDirection === triggerDirection
    ),
    (stopOrder) => BigInt((stopOrder.trigger as Schema.StopOrderPrice).price),
    order
  );

const getAllocation = (stopOrders: StopOrderFieldsFragment[] | undefined) =>
  stopOrders?.reduce((allocation, stopOrder) => {
    return allocation + (Number(stopOrder.sizeOverrideValue) || 0);
  }, 0) || 0;

export const TakeProfitStopLossDialog = ({
  marketId,
  open,
  onClose,
  create,
}: TakeProfitStopLossDialogProps) => {
  const [visibleForm, setVisibleForm] = useState<'sl' | 'tp' | undefined>(
    undefined
  );
  const { data: market } = useMarket(marketId);
  const { pubKey } = useVegaWallet();
  const { data: activeStopOrders } = useDataProvider({
    dataProvider: stopOrdersProvider,
    variables: {
      filter: {
        parties: pubKey ? [pubKey] : [],
        markets: [marketId],
        liveOnly: true,
      },
    },
  });
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

  const { data: markPrice } = useDataProvider({
    dataProvider: markPriceProvider,
    variables: { marketId },
  });

  const t = useT();
  return (
    <Dialog
      title={t('TP/SL for entire position')}
      size="small"
      open={open}
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <dl className="mb-6 grid grid-cols-2 gap-1 font-alpha text-vega-clight-50 dark:text-vega-cdark-50">
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Symbol')}
        </dt>
        <dd className="text-right">
          {market?.tradableInstrument.instrument.code}
        </dd>
        <dt className="text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Entry price')}
        </dt>
        <dd className="text-right">
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
        <dd className="text-right">
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
      <div className="mb-6">
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
        {visibleForm !== 'tp' ? (
          <Button
            className="w-full"
            type="button"
            data-testid="add-sl"
            onClick={() => setVisibleForm('tp')}
          >
            {t('Add TP')}
          </Button>
        ) : (
          market && (
            <Setup
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
      <div className="mb-6">
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
        {visibleForm !== 'sl' ? (
          <Button
            className="w-full"
            type="button"
            data-testid="add-sl"
            onClick={() => setVisibleForm('sl')}
          >
            {t('Add SL')}
          </Button>
        ) : (
          market && (
            <Setup
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
    </Dialog>
  );
};
