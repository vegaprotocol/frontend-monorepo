import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Stepper } from '../stepper';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import { InputError } from '@vegaprotocol/ui-toolkit';
import {
  DealTicketAmount,
  getDialogTitle,
  getDialogIntent,
  getDialogIcon,
  MarketSelector,
} from '@vegaprotocol/deal-ticket';
import type { Order } from '@vegaprotocol/orders';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { t, addDecimal, toDecimal } from '@vegaprotocol/react-helpers';
import {
  getDefaultOrder,
  useOrderValidation,
  useOrderSubmit,
  OrderFeedback,
} from '@vegaprotocol/orders';
import MarketNameRenderer from '../simple-market-list/simple-market-renderer';
import SideSelector, { SIDE_NAMES } from './side-selector';
import ReviewTrade from './review-trade';
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';

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
    (marketId) => {
      navigate(`/trading/${marketId}`);
    },
    [navigate]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Order>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const step = toDecimal(market.positionDecimalPlaces);
  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const orderSide = watch('side');
  const order = watch();

  const { message: invalidText, isDisabled } = useOrderValidation({
    step,
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });

  const { submit, transaction, finalizedOrder, TransactionDialog } =
    useOrderSubmit(market);

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
      component: (
        <DealTicketAmount
          orderType={orderType}
          step={step}
          register={register}
          price={
            market.depth.lastTrade
              ? addDecimal(market.depth.lastTrade.price, market.decimalPlaces)
              : undefined
          }
          quoteName={market.tradableInstrument.instrument.product.quoteName}
        />
      ),
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
            partyData={partyData}
          />
          <TransactionDialog
            title={getDialogTitle(finalizedOrder?.status)}
            intent={getDialogIntent(finalizedOrder?.status)}
            icon={getDialogIcon(finalizedOrder?.status)}
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
