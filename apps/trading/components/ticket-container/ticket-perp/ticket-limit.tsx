import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';

import { Form, FormGrid, FormGridCol } from '../elements/form';
import * as Fields from '../fields';
import { FormFieldsLimit, schemaLimit } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';

export const TicketLimit = (props: FormProps) => {
  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schemaLimit),
    defaultValues: {
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: '',
      price: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
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
          // eslint-disable-next-line no-console
          console.log(fields);
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
