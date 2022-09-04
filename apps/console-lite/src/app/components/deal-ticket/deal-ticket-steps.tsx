import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Stepper } from '../stepper';
import type { DealTicketMarketFragment } from '@vegaprotocol/deal-ticket';
import {
  getDefaultOrder,
  useOrderValidation,
  validateSize,
} from '@vegaprotocol/deal-ticket';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { MarketSelector } from '@vegaprotocol/deal-ticket';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet, VegaTxStatus } from '@vegaprotocol/wallet';
import {
  t,
  addDecimalsFormatNumber,
  toDecimal,
  removeDecimal,
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
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';
import useOrderCloseOut from '../../hooks/use-order-closeout';
import useOrderMargin from '../../hooks/use-order-margin';
import useMaximumPositionSize from '../../hooks/use-maximum-position-size';
import useCalculateSlippage from '../../hooks/use-calculate-slippage';
import { Side, OrderType } from '@vegaprotocol/types';
import { DealTicketSlippage } from './deal-ticket-slippage';

interface DealTicketMarketProps {
  market: DealTicketMarketFragment;
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
  } = useForm<OrderSubmissionBody['orderSubmission']>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const emptyString = ' - ';
  const step = toDecimal(market.positionDecimalPlaces);
  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const orderSide = watch('side');
  const orderSize = watch('size');
  const order = watch();
  const { message: invalidText, isDisabled } = useOrderValidation({
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });
  const { submit, transaction, finalizedOrder, Dialog } = useOrderSubmit();
  const { keypair } = useVegaWallet();
  const estMargin = useOrderMargin({
    order,
    market,
    partyId: keypair || '',
  });

  const maxTrade = useMaximumPositionSize({
    partyId: keypair || '',
    accounts: partyData?.party?.accounts || [],
    marketId: market.id,
    settlementAssetId:
      market.tradableInstrument.instrument.product.settlementAsset.id,
    price: market?.depth?.lastTrade?.price,
    order,
  });

  const estCloseOut = useOrderCloseOut({ order, market, partyData });
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
      const isLong = order.side === Side.SIDE_BUY;
      const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
        parseFloat(slippage) / 100
      );
      return new BigNumber(market?.depth?.lastTrade?.price)
        .multipliedBy(multiplier)
        .toNumber();
    }
    return null;
  }, [market?.depth?.lastTrade?.price, order.side, slippage]);

  const formattedPrice =
    price && addDecimalsFormatNumber(price, market.decimalPlaces);

  const notionalSize = useMemo(() => {
    if (price) {
      const size = new BigNumber(price).multipliedBy(orderSize).toNumber();

      return addDecimalsFormatNumber(size, market.decimalPlaces);
    }
    return null;
  }, [market.decimalPlaces, orderSize, price]);

  const fees = useMemo(() => {
    if (estMargin?.fees && notionalSize) {
      const percentage = new BigNumber(estMargin?.fees)
        .dividedBy(notionalSize)
        .multipliedBy(100)
        .decimalPlaces(2)
        .toString();

      return `${estMargin.fees} (${percentage}%)`;
    }

    return null;
  }, [estMargin?.fees, notionalSize]);

  const max = useMemo(() => {
    return new BigNumber(maxTrade)
      .decimalPlaces(market.positionDecimalPlaces)
      .toNumber();
  }, [market.positionDecimalPlaces, maxTrade]);

  const onSizeChange = useCallback(
    (value: number) => {
      const newVal = new BigNumber(value)
        .decimalPlaces(market.positionDecimalPlaces)
        .toString();
      const isValid = validateSize(step)(newVal);
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
          const isLong = order.side === Side.SIDE_BUY;
          const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
            value / 100
          );
          const bestAskPrice = new BigNumber(market?.depth?.lastTrade?.price)
            .multipliedBy(multiplier)
            .decimalPlaces(market.decimalPlaces)
            .toString();

          setValue('price', bestAskPrice);

          if (orderType === OrderType.TYPE_MARKET) {
            setValue('type', OrderType.TYPE_LIMIT);
          }
        } else {
          setValue('type', OrderType.TYPE_MARKET);
          setValue('price', market?.depth?.lastTrade?.price);
        }
      }
      setSlippageValue(value);
    },
    [
      market.decimalPlaces,
      market?.depth?.lastTrade?.price,
      order.side,
      orderType,
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
      value: SIDE_NAMES[orderSide] || '',
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
              size={new BigNumber(orderSize).toNumber()}
              name="size"
              price={formattedPrice || emptyString}
              positionDecimalPlaces={market.positionDecimalPlaces}
              quoteName={
                market.tradableInstrument.instrument.product.settlementAsset
                  .symbol
              }
              notionalSize={notionalSize || emptyString}
              estCloseOut={estCloseOut}
              fees={fees || emptyString}
              estMargin={estMargin?.margin || emptyString}
            />
            <DealTicketSlippage
              value={slippageValue}
              onValueChange={onSlippageChange}
            />
          </>
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
            estCloseOut={estCloseOut}
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
          >
            <OrderFeedback transaction={transaction} order={finalizedOrder} />
          </Dialog>
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
