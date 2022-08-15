import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Stepper } from '../stepper';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import {
  getOrderDialogTitle,
  getOrderDialogIntent,
  getOrderDialogIcon,
  MarketSelector,
} from '@vegaprotocol/deal-ticket';
import type { Order } from '@vegaprotocol/orders';
import { useVegaWallet, VegaTxStatus } from '@vegaprotocol/wallet';
import { t, addDecimal, toDecimal } from '@vegaprotocol/react-helpers';
import {
  getDefaultOrder,
  useOrderValidation,
  useOrderSubmit,
  OrderFeedback,
  validateSize,
} from '@vegaprotocol/orders';
import { DealTicketSize } from './deal-ticket-size';
import MarketNameRenderer from '../simple-market-list/simple-market-renderer';
import SideSelector, { SIDE_NAMES } from './side-selector';
import ReviewTrade from './review-trade';
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';
import useOrderCloseOut from '../../hooks/use-order-closeout';
import useOrderMargin from '../../hooks/use-order-margin';
import useMaximumPositionSize from '../../hooks/use-maximum-position-size';

interface DealTicketMarketProps {
  market: DealTicketQuery_market;
  partyData?: PartyBalanceQuery;
}

export const DealTicketSteps = ({
  market,
  partyData,
}: DealTicketMarketProps) => {
  const navigate = useNavigate();
  const setMarket = useCallback(
    (marketId: string) => {
      navigate(`/trading/${marketId}`);
    },
    [navigate]
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Order>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const [max, setMax] = useState<number | null>(null);
  const step = toDecimal(market.positionDecimalPlaces);
  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const orderSide = watch('side');
  const orderSize = watch('size');
  const order = watch();
  const estCloseOut = useOrderCloseOut({ order, market, partyData });
  const { keypair } = useVegaWallet();
  const estMargin = useOrderMargin({
    order,
    market,
    partyId: keypair?.pub || '',
  });
  const value = new BigNumber(orderSize).toNumber();
  const price =
    market.depth.lastTrade &&
    addDecimal(market.depth.lastTrade.price, market.decimalPlaces);
  const emptyString = ' - ';

  const [notionalSize, setNotionalSize] = useState<string | null>(null);

  const maxTrade = useMaximumPositionSize({
    partyId: keypair?.pub || '',
    accounts: partyData?.party?.accounts || [],
    marketId: market.id,
    settlementAssetId:
      market.tradableInstrument.instrument.product.settlementAsset.id,
    price: market?.depth?.lastTrade?.price,
    order,
  });

  useEffect(() => {
    setMax(
      new BigNumber(maxTrade)
        .decimalPlaces(market.positionDecimalPlaces)
        .toNumber()
    );
  }, [maxTrade, market.positionDecimalPlaces]);

  const { message: invalidText, isDisabled } = useOrderValidation({
    step,
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });

  const { submit, transaction, finalizedOrder, TransactionDialog } =
    useOrderSubmit(market);

  const onSizeChange = (value: number[]) => {
    const newVal = new BigNumber(value[0])
      .decimalPlaces(market.positionDecimalPlaces)
      .toString();
    const isValid = validateSize(step)(newVal);
    if (isValid !== 'step') {
      setValue('size', newVal);
    }
  };

  useEffect(() => {
    if (market?.depth?.lastTrade?.price) {
      const size = new BigNumber(market.depth.lastTrade.price)
        .multipliedBy(value)
        .decimalPlaces(market.decimalPlaces)
        .toFormat(market.decimalPlaces);

      setNotionalSize(size);
    }
  }, [market, value]);

  const transactionStatus =
    transaction.status === VegaTxStatus.Requested ||
    transaction.status === VegaTxStatus.Pending
      ? 'pending'
      : 'default';

  const onSubmit = React.useCallback(
    (order: Order) => {
      if (transactionStatus !== 'pending') {
        submit(order);
      }
    },
    [transactionStatus, submit]
  );

  const steps = [
    {
      label: t('Select Market'),
      component: (
        <MarketSelector
          market={market}
          setMarket={setMarket}
          ItemRenderer={MarketNameRenderer}
        />
      ),
      value: market.name,
    },
    {
      label: t('Select Direction'),
      component: (
        <Controller
          name="side"
          control={control}
          render={({ field }) => (
            <SideSelector value={field.value} onSelect={field.onChange} />
          )}
        />
      ),
      value: SIDE_NAMES[orderSide] || '',
    },
    {
      label: t('Choose Position Size'),
      component:
        max !== null ? (
          <DealTicketSize
            step={step}
            min={step}
            max={max}
            onValueChange={onSizeChange}
            value={new BigNumber(orderSize).toNumber()}
            name="size"
            price={price || emptyString}
            positionDecimalPlaces={market.positionDecimalPlaces}
            quoteName={
              market.tradableInstrument.instrument.product.settlementAsset
                .symbol
            }
            notionalSize={notionalSize || emptyString}
            estCloseOut={estCloseOut}
            fees={estMargin?.fees || emptyString}
            estMargin={estMargin?.margin || emptyString}
          />
        ) : (
          'loading...'
        ),
      value: orderSize,
    },
    {
      label: t('Review Trade'),
      component: (
        <div className="mb-8">
          {invalidText && (
            <InputError className="mb-8" data-testid="dealticket-error-message">
              {invalidText}
            </InputError>
          )}
          <ReviewTrade
            market={market}
            isDisabled={isDisabled}
            transactionStatus={transactionStatus}
            order={order}
            estCloseOut={estCloseOut}
            estMargin={estMargin?.margin || emptyString}
          />
          <TransactionDialog
            title={getOrderDialogTitle(finalizedOrder?.status)}
            intent={getOrderDialogIntent(finalizedOrder?.status)}
            icon={getOrderDialogIcon(finalizedOrder?.status)}
          >
            <OrderFeedback transaction={transaction} order={finalizedOrder} />
          </TransactionDialog>
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-8">
      <Stepper steps={steps} />
    </form>
  );
};
