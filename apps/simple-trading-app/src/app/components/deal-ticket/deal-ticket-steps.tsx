import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Stepper } from '../stepper';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { DealTicketAmount, MarketSelector } from '@vegaprotocol/deal-ticket';
import type { Order } from '@vegaprotocol/orders';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { t, addDecimal, toDecimal } from '@vegaprotocol/react-helpers';
import {
  getDefaultOrder,
  useOrderValidation,
  useOrderSubmit,
} from '@vegaprotocol/orders';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketNameRenderer from '../simple-market-list/simple-market-renderer';
import SideSelector, { SIDE_NAMES } from './side-selector';

interface DealTicketMarketProps {
  market: DealTicketQuery_market;
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

  const { message: invalidText, isDisabled } = useOrderValidation({
    step,
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });

  const { submit, transaction } = useOrderSubmit(market);

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
          step={0.02}
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
          <Button
            className="w-full mb-8"
            variant="primary"
            type="submit"
            disabled={transactionStatus === 'pending' || isDisabled}
            data-testid="place-order"
          >
            {transactionStatus === 'pending'
              ? t('Pending...')
              : t('Place order')}
          </Button>
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
