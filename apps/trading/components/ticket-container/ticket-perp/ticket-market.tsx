import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/utils';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';

import { Form, FormGrid, FormGridCol } from '../elements/form';
import * as Fields from '../fields';
import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { SizeSlider } from '../size-slider';

export const TicketMarket = (props: FormProps) => {
  const create = useVegaTransactionStore((state) => state.create);

  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      tpSl: false,
      reduceOnly: false,
    },
  });

  const tpSl = form.watch('tpSl');

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          create({
            orderSubmission: {
              marketId: props.market.id,
              type: fields.type,
              side: fields.side,
              timeInForce: fields.timeInForce,
              size: removeDecimal(
                fields.size,
                props.market.positionDecimalPlaces
              ),
            },
          });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        <Fields.Size control={form.control} />
        <SizeSlider
          market={props.market}
          asset={props.asset}
          balances={props.balances}
        />
        <FormGrid>
          <FormGridCol>
            <Fields.TpSl control={form.control} />
            <Fields.ReduceOnly control={form.control} />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce control={form.control} />
          </FormGridCol>
        </FormGrid>
        {tpSl && (
          <FormGrid>
            <FormGridCol>
              <Fields.TakeProfit control={form.control} />
            </FormGridCol>
            <FormGridCol>
              <Fields.StopLoss control={form.control} />
            </FormGridCol>
          </FormGrid>
        )}
        <TradingButton intent={Intent.Secondary} size="large" type="submit">
          Submit
        </TradingButton>
        <pre className="block w-full text-2xs">
          {JSON.stringify(form.getValues(), null, 2)}
        </pre>
        <pre className="block w-full text-2xs">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </Form>
    </FormProvider>
  );
};
