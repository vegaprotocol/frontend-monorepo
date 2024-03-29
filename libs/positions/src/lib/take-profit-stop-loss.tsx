import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  TradingButton as Button,
  ButtonLink,
  TradingInput as Input,
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
import { type FormEventHandler, useEffect, useState } from 'react';

import { useOpenVolume } from './use-open-volume';
import {
  type StopOrderFieldsFragment,
  stopOrdersProvider,
} from '@vegaprotocol/orders';

import {
  addDecimalsFormatNumber,
  determinePriceStep,
  removeDecimal,
} from '@vegaprotocol/utils';
import {
  type Market,
  markPriceProvider,
  useMarket,
  getQuoteName,
} from '@vegaprotocol/markets';
import { useT } from '../use-t';

interface TakeProfitStopLossDialogProps {
  open: boolean;
  onClose: () => void;
  marketId: string;
  create: VegaTransactionStore['create'];
}

const POLLING_TIME = 2000;

export const Setup = ({
  allocation,
  create,
  market,
  side,
  triggerDirection,
}: {
  create: VegaTransactionStore['create'];
  market: Market;
  side: Schema.Side;
  triggerDirection: Schema.StopOrderTriggerDirection;
  allocation?: number;
}) => {
  const t = useT();
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const priceStep = determinePriceStep(market);
  const quoteName = getQuoteName(market);
  const transaction = useVegaTransactionStore(
    (state) => state.transactions
  ).find((transaction) => {
    if (
      !transaction ||
      [VegaTxStatus.Error, VegaTxStatus.Complete].includes(
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
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (transaction) {
      return;
    }
    const stopOrdersSubmission: StopOrdersSubmission = {
      risesAbove: undefined,
      fallsBelow: undefined,
    };
    const stopOrderSetup: StopOrderSetup = {
      sizeOverrideSetting: SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
      sizeOverrideValue: { percentage: '1' },
      price: removeDecimal(price, market.decimalPlaces),
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

  return (
    <form onSubmit={onSubmit}>
      <div className="flex gap-2 mb-2">
        <div className="w-1/2">
          <Input
            type="number"
            id="price-input"
            className="w-full"
            min={priceStep}
            step={priceStep}
            appendElement={<Pill size="xs">{quoteName}</Pill>}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <Input
            type="number"
            id="size-input"
            className="w-full"
            min={0.1}
            max={100 - (allocation ?? 0)}
            step={0.1}
            appendElement={<Pill size="xs">%</Pill>}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
      </div>
      <Button
        disabled={!!transaction}
        className="w-full"
        type="submit"
        data-testid="confirm-isolated-margin-mode"
      >
        {transaction ? t('Processing') : t('Confirm')}
      </Button>
    </form>
  );
};

const StopOrder = ({
  stopOrder,
  decimalPlaces,
  symbol,
  create,
}: {
  stopOrder: StopOrderFieldsFragment;
  decimalPlaces?: Market['decimalPlaces'];
  symbol?: string | null;
  create: VegaTransactionStore['create'];
}) => {
  const t = useT();
  return (
    <div className="flex justify-between">
      {t('Reduce {{value}}% at {{price}} {{symbol}}', {
        value: (Number(stopOrder.sizeOverrideValue) * 100).toFixed(),
        price:
          stopOrder.trigger.__typename === 'StopOrderPrice' &&
          decimalPlaces !== undefined
            ? addDecimalsFormatNumber(stopOrder.trigger.price, decimalPlaces)
            : '',
        symbol,
      })}
      <ButtonLink
        data-testid="close-position"
        onClick={() =>
          create({
            stopOrdersCancellation: {
              stopOrderId: stopOrder.id,
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
  stopOrders,
  decimalPlaces,
  symbol,
  create,
}: {
  stopOrders?: StopOrderFieldsFragment[];
  decimalPlaces?: Market['decimalPlaces'];
  symbol?: string | null;
  create: VegaTransactionStore['create'];
}) => {
  const t = useT();
  return (
    <>
      {stopOrders?.length && (
        <ButtonLink
          data-testid="close-position"
          onClick={() =>
            create(
              stopOrders.length > 1
                ? {
                    batchMarketInstructions: {
                      stopOrdersCancellation: stopOrders?.map(
                        ({ id: stopOrderId }) => ({ stopOrderId })
                      ),
                    },
                  }
                : {
                    stopOrdersCancellation: {
                      stopOrderId: stopOrders[0].id,
                    },
                  }
            )
          }
          title={t('Close all')}
        >
          {t('Close all')}
        </ButtonLink>
      )}
      {stopOrders?.map((stopOrder) => (
        <StopOrder
          stopOrder={stopOrder}
          decimalPlaces={decimalPlaces}
          symbol={symbol}
          create={create}
        />
      ))}
    </>
  );
};

export const TakeProfitStopLossDialog = ({
  marketId,
  open,
  onClose,
  create,
}: TakeProfitStopLossDialogProps) => {
  const { data: market } = useMarket(marketId);
  const { pubKey } = useVegaWallet();
  const { data: activeStopOrders, reload } = useDataProvider({
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
      ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;

  const takeProfitStopOrders = activeStopOrders?.filter(
    (order) =>
      order.sizeOverrideSetting ===
        Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION &&
      order.triggerDirection === takeProfitTrigger
  );

  const takeProfitAllocation = takeProfitStopOrders?.reduce(
    (allocation, stopOrder) =>
      (allocation += Number(stopOrder.sizeOverrideValue) || 0),
    0
  );

  const stopLossStopOrders = activeStopOrders?.filter(
    (order) =>
      order.sizeOverrideSetting ===
        Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION &&
      order.triggerDirection === stopLossTrigger
  );

  const stopLossAllocation = stopLossStopOrders?.reduce(
    (allocation, stopOrder) =>
      (allocation += Number(stopOrder.sizeOverrideValue) || 0),
    0
  );

  const { data: markPrice } = useDataProvider({
    dataProvider: markPriceProvider,
    variables: { marketId },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, POLLING_TIME);
    return () => {
      clearInterval(interval);
    };
  }, [reload]);

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
      <dl>
        <dt>{t('Symbol')}</dt>
        <dd>{market?.tradableInstrument.instrument.code}</dd>
        <dt>{t('Entry price')}</dt>
        <dd>
          {openVolume?.averageEntryPrice &&
            market &&
            `${addDecimalsFormatNumber(
              openVolume.averageEntryPrice,
              market?.decimalPlaces
            )}} ${quoteName}`}
        </dd>
        <dt>{t('Mark price')}</dt>
        <dd>
          {markPrice &&
            market &&
            `${addDecimalsFormatNumber(
              markPrice,
              market?.decimalPlaces
            )} ${quoteName}`}
        </dd>
      </dl>
      <div>{t('Take profit')}</div>
      <StopOrdersList
        stopOrders={takeProfitStopOrders}
        decimalPlaces={market?.decimalPlaces}
        create={create}
        symbol={quoteName}
      />
      {market && (
        <Setup
          allocation={takeProfitAllocation}
          create={create}
          market={market}
          side={side}
          triggerDirection={takeProfitTrigger}
        />
      )}

      <div className="">{t('Stop loss')}</div>
      <StopOrdersList
        stopOrders={stopLossStopOrders}
        decimalPlaces={market?.decimalPlaces}
        create={create}
        symbol={quoteName}
      />
      {market && (
        <Setup
          allocation={stopLossAllocation}
          create={create}
          market={market}
          side={side}
          triggerDirection={stopLossTrigger}
        />
      )}
    </Dialog>
  );
};
