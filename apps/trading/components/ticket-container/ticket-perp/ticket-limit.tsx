import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

import { Form, FormGrid, FormGridCol } from '../elements/form';
import * as Fields from '../fields';
import { type FormFieldsLimit, schemaLimit } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useTicketContext } from '../ticket-context';
import { toNanoSeconds } from '@vegaprotocol/utils';
import { addDays } from 'date-fns';

export const TicketLimit = (props: FormProps) => {
  // const create = useVegaTransactionStore((state) => state.create);
  const ticket = useTicketContext();

  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schemaLimit),
    defaultValues: {
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: '',
      price: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: addDays(new Date(), 1),
      tpSl: false,
      postOnly: false,
      reduceOnly: false,
      iceberg: false,
    },
  });

  const tpSl = form.watch('tpSl');
  const iceberg = form.watch('iceberg');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const orderSubmission = {
            marketId: ticket.market.id,
            type: fields.type,
            side: fields.side,
            timeInForce: fields.timeInForce,
            size: fields.size,
            price: fields.price,
            expiresAt:
              fields.expiresAt &&
              fields.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
                ? toNanoSeconds(fields.expiresAt)
                : undefined,
            postOnly: fields.postOnly,
            reduceOnly: fields.reduceOnly,
            icebergOpts: {
              peakSize: fields.icebergPeakSize,
              minimumVisibleSize: fields.icebergMinVisibleSize,
            },
          };

          // eslint-disable-next-line no-console
          console.log(orderSubmission);

          // create({
          //   orderSubmission,
          // });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="limit" onTypeChange={props.onTypeChange} />
        <Fields.Size control={form.control} />
        <Fields.Price control={form.control} />
        <FormGrid>
          <FormGridCol>
            {isPersistent ? (
              <>
                <Fields.PostOnly control={form.control} />
                <Fields.Iceberg control={form.control} />
              </>
            ) : (
              <Fields.ReduceOnly control={form.control} />
            )}
            <Fields.TpSl control={form.control} />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce control={form.control} />
            {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && <Fields.ExpiresAt />}
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
        {iceberg && (
          <FormGrid>
            <FormGridCol>
              <Fields.IcebergPeakSize control={form.control} />
            </FormGridCol>
            <FormGridCol>
              <Fields.IcebergMinVisibleSize control={form.control} />
            </FormGridCol>
          </FormGrid>
        )}
        <TradingButton intent={Intent.Secondary} size="large" type="submit">
          Submit
        </TradingButton>
        <pre className="block w-full text-2xs">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </Form>
    </FormProvider>
  );
};
