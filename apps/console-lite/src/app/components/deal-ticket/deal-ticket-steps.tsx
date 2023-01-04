import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Stepper } from '../stepper';
import {
  getDefaultOrder,
  useOrderCloseOut,
  useOrderMargin,
  useMaximumPositionSize,
  useCalculateSlippage,
} from '@vegaprotocol/deal-ticket';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { MarketSelector } from '@vegaprotocol/deal-ticket';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import {
  t,
  toDecimal,
  removeDecimal,
  addDecimalsFormatNumber,
  addDecimal,
  formatNumber,
  validateAmount,
} from '@vegaprotocol/react-helpers';
import {
  useOrderSubmit,
  getOrderDialogTitle,
  getOrderDialogIntent,
  getOrderDialogIcon,
  OrderFeedback,
} from '@vegaprotocol/orders';
import { DealTicketSize } from './deal-ticket-size';
import MarketNameRenderer from '../simple-market-list/simple-market-renderer';
import SideSelector, { SIDE_NAMES } from './side-selector';
import ReviewTrade from './review-trade';
import * as Schema from '@vegaprotocol/types';
import { DealTicketSlippage } from './deal-ticket-slippage';
import { useOrderValidation } from './use-order-validation';
import type { MarketDealTicket } from '@vegaprotocol/market-list';

interface DealTicketMarketProps {
  market: MarketDealTicket;
}

export const DealTicketSteps = ({ market }: DealTicketMarketProps) => {
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
  } = useForm<OrderSubmissionBody['orderSubmission']>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const emptyString = ' - ';
  const step = toDecimal(market.positionDecimalPlaces);
  const order = watch();
  const { pubKey } = useVegaWallet();
  const { message: invalidText, isDisabled } = useOrderValidation({
    market,
    order,
    fieldErrors: errors,
  });
  const { submit, transaction, finalizedOrder, Dialog } = useOrderSubmit();

  const maxTrade = useMaximumPositionSize({
    marketId: market.id,
    settlementAssetId:
      market.tradableInstrument.instrument.product.settlementAsset.id,
    price: market?.depth?.lastTrade?.price,
    order,
  });

  const estCloseOut = useOrderCloseOut({
    order,
    market,
  });
  const slippage = useCalculateSlippage({ marketId: market.id, order });
  const [slippageValue, setSlippageValue] = useState(
    slippage ? parseFloat(slippage) : 0
  );
  const transactionStatus =
    transaction.status === VegaTxStatus.Requested ||
    transaction.status === VegaTxStatus.Pending
      ? 'pending'
      : 'default';

  useEffect(() => {
    setSlippageValue(slippage ? parseFloat(slippage) : 0);
  }, [slippage]);

  const price = useMemo(() => {
    if (slippage && market?.depth?.lastTrade?.price) {
      const isLong = order.side === Schema.Side.SIDE_BUY;
      const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
        parseFloat(slippage) / 100
      );
      return new BigNumber(market?.depth?.lastTrade?.price)
        .multipliedBy(multiplier)
        .toString();
    }
    return undefined;
  }, [market?.depth?.lastTrade?.price, order.side, slippage]);

  const estMargin = useOrderMargin({
    order,
    market,
    partyId: pubKey || '',
    derivedPrice: price,
  });

  const formattedPrice =
    price && addDecimalsFormatNumber(price, market.decimalPlaces);

  const notionalSize = useMemo(() => {
    if (price) {
      const size = new BigNumber(price).multipliedBy(order.size).toNumber();

      return addDecimalsFormatNumber(size, market.decimalPlaces);
    }
    return null;
  }, [market.decimalPlaces, order.size, price]);

  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;

  const fees = useMemo(() => {
    if (estMargin?.totalFees && notionalSize) {
      const percentage = new BigNumber(estMargin?.totalFees)
        .dividedBy(notionalSize)
        .multipliedBy(100)
        .decimalPlaces(2)
        .toString();

      return `${addDecimalsFormatNumber(
        estMargin.totalFees,
        assetDecimals
      )} (${formatNumber(addDecimal(percentage, assetDecimals), 2)}%)`;
    }

    return null;
  }, [assetDecimals, estMargin?.totalFees, notionalSize]);

  const max = useMemo(() => {
    return new BigNumber(maxTrade)
      .decimalPlaces(market.positionDecimalPlaces)
      .toNumber();
  }, [market.positionDecimalPlaces, maxTrade]);

  useEffect(() => {
    setSlippageValue(slippage ? parseFloat(slippage) : 0);
  }, [slippage]);

  const onSizeChange = useCallback(
    (value: number) => {
      const newVal = new BigNumber(value)
        .decimalPlaces(market.positionDecimalPlaces)
        .toString();
      const isValid = validateAmount(step, 'Size')(newVal);
      if (isValid !== 'step') {
        setValue('size', newVal);
      }
    },
    [market.positionDecimalPlaces, setValue, step]
  );

  const onSlippageChange = useCallback(
    (value: number) => {
      if (market?.depth?.lastTrade?.price) {
        if (value) {
          const isLong = order.side === Schema.Side.SIDE_BUY;
          const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
            value / 100
          );
          const bestAskPrice = new BigNumber(market?.depth?.lastTrade?.price)
            .multipliedBy(multiplier)
            .decimalPlaces(market.decimalPlaces)
            .toString();

          setValue('price', bestAskPrice);

          if (order.type === Schema.OrderType.TYPE_MARKET) {
            setValue('type', Schema.OrderType.TYPE_LIMIT);
          }
        } else {
          setValue('type', Schema.OrderType.TYPE_MARKET);
          setValue('price', market?.depth?.lastTrade?.price);
        }
      }
      setSlippageValue(value);
    },
    [
      market.decimalPlaces,
      market?.depth?.lastTrade?.price,
      order.side,
      order.type,
      setSlippageValue,
      setValue,
    ]
  );

  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (transactionStatus !== 'pending') {
        submit({
          ...order,
          price:
            order.price && removeDecimal(order.price, market.decimalPlaces),
          size: removeDecimal(order.size, market.positionDecimalPlaces),
        });
      }
    },
    [
      transactionStatus,
      submit,
      market.decimalPlaces,
      market.positionDecimalPlaces,
    ]
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
      value: market.tradableInstrument.instrument.name,
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
      value: SIDE_NAMES[order.side] || '',
    },
    {
      label: t('Choose Position Size'),
      component:
        max !== null ? (
          <>
            <DealTicketSize
              step={step}
              min={step}
              max={max}
              onSizeChange={onSizeChange}
              size={new BigNumber(order.size).toNumber()}
              name="size"
              price={formattedPrice || emptyString}
              positionDecimalPlaces={market.positionDecimalPlaces}
              quoteName={
                market.tradableInstrument.instrument.product.settlementAsset
                  .symbol
              }
              notionalSize={notionalSize || emptyString}
              estCloseOut={estCloseOut || emptyString}
              fees={fees || emptyString}
              estMargin={estMargin?.margin || emptyString}
            />
            <DealTicketSlippage
              value={slippageValue}
              onValueChange={onSlippageChange}
            />
          </>
        ) : (
          t('Loading...')
        ),
      value: order.size,
    },
    {
      label: t('Review Trade'),
      component: (
        <div className="mb-8">
          {invalidText && (
            <div className="mb-2">
              <InputError data-testid="dealticket-error-message">
                {invalidText}
              </InputError>
            </div>
          )}
          <ReviewTrade
            market={market}
            isDisabled={isDisabled}
            transactionStatus={transactionStatus}
            order={order}
            estCloseOut={estCloseOut || emptyString}
            estMargin={estMargin?.margin || emptyString}
            price={formattedPrice || emptyString}
            quoteName={
              market.tradableInstrument.instrument.product.settlementAsset
                .symbol
            }
            notionalSize={notionalSize || emptyString}
            fees={fees || emptyString}
            slippage={slippageValue}
          />
          <Dialog
            title={getOrderDialogTitle(finalizedOrder?.status)}
            intent={getOrderDialogIntent(finalizedOrder?.status)}
            icon={getOrderDialogIcon(finalizedOrder?.status)}
            content={{
              Complete: (
                <OrderFeedback
                  transaction={transaction}
                  order={finalizedOrder}
                />
              ),
            }}
          />
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-2 py-4">
      <Stepper steps={steps} />
    </form>
  );
};
