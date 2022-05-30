import * as React from 'react';
import type { FormEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import { Stepper } from '../stepper';
import type { DealTicketQuery_market ,
  Order} from '@vegaprotocol/deal-ticket';
import { Button } from '@vegaprotocol/ui-toolkit';
import {
  ExpirySelector,
  SideSelector,
  TimeInForceSelector,
  TypeSelector,
  getDefaultOrder,
  useOrderSubmit,
  DealTicketAmount,
} from '@vegaprotocol/deal-ticket';
import {
  OrderTimeInForce,
  OrderType,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import { t, addDecimal, toDecimal } from '@vegaprotocol/react-helpers';

interface DealTicketMarketProps {
  market: DealTicketQuery_market;
}

export const DealTicketSteps = ({ market }: DealTicketMarketProps) => {
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

  const { submit, transaction } = useOrderSubmit(market);

  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');

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
    [transactionStatus]
  );

  const steps = [
    {
      label: 'Select Asset',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: <div />,
    },
    {
      label: 'Select Order Type',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TypeSelector value={field.value} onSelect={field.onChange} />
          )}
        />
      ),
    },
    {
      label: 'Select Market Position',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <Controller
          name="side"
          control={control}
          render={({ field }) => (
            <SideSelector value={field.value} onSelect={field.onChange} />
          )}
        />
      ),
    },
    {
      label: 'Select Order Size',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
      label: 'Select Time In Force',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <>
          <Controller
            name="timeInForce"
            control={control}
            render={({ field }) => (
              <TimeInForceSelector
                value={field.value}
                orderType={orderType}
                onSelect={field.onChange}
              />
            )}
          />
          {orderType === OrderType.Limit &&
            orderTimeInForce === OrderTimeInForce.GTT && (
              <Controller
                name="expiration"
                control={control}
                render={({ field }) => (
                  <ExpirySelector
                    value={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
            )}
        </>
      ),
    },
    {
      label: 'Review & Submit Order',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <Box sx={{ mb: 2 }}>
          <Button
            className="w-full mb-8"
            variant="primary"
            type="submit"
            disabled={transactionStatus === 'pending'}
            data-testid="place-order"
          >
            {transactionStatus === 'pending'
              ? t('Pending...')
              : t('Place order')}
          </Button>
        </Box>
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
