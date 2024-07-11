import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import {
  OrderType,
  OrderTimeInForce,
  Side,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
} from '@vegaprotocol/types';

import { FieldControls, Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsStopLimit, schemaStopLimit } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';

import * as Fields from '../fields';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { mapFormValuesToStopOrdersSubmission } from '@vegaprotocol/deal-ticket';

export const TicketStopLimit = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('default');

  const form = useForm<FormFieldsStopLimit>({
    resolver: zodResolver(schemaStopLimit),
    defaultValues: {
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      trigger: '',
      price: '',
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      size: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: addDays(new Date(), 1),
      postOnly: false,
      reduceOnly: false,
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoTrigger: '',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      ocoSize: '',
      ocoPrice: '',
    },
  });

  const size = form.watch('size');
  const price = form.watch('price');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);
  const oco = form.watch('oco');

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          create({
            // TODO: convert this func to take the schema values
            stopOrdersSubmission: mapFormValuesToStopOrdersSubmission(
              fields,
              ticket.market.id,
              ticket.market.decimalPlaces,
              ticket.market.positionDecimalPlaces,
              false
            ),
          });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="stopLimit" onTypeChange={props.onTypeChange} />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopTriggerDirection control={form.control} />
            <Fields.StopTriggerType control={form.control} />
          </FieldControls>
          <Fields.StopTrigger control={form.control} />
        </div>
        <Fields.Price control={form.control} />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopSizeOverride control={form.control} />
          </FieldControls>
          <Fields.StopSize control={form.control} />
        </div>
        <FormGrid>
          <FormGridCol>
            {isPersistent ? (
              <Fields.PostOnly control={form.control} />
            ) : (
              <Fields.ReduceOnly control={form.control} />
            )}
            <Fields.OCO control={form.control} />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce control={form.control} />
            {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
              <Fields.ExpiresAt control={form.control} />
            )}
          </FormGridCol>
        </FormGrid>
        {oco && (
          <>
            <hr className="border-default my-4" />
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopTriggerDirection
                  control={form.control}
                  name="ocoTriggerDirection"
                />
                <Fields.StopTriggerType
                  control={form.control}
                  name="ocoTriggerType"
                />
              </FieldControls>
              <Fields.StopTrigger control={form.control} name="ocoTrigger" />
            </div>
            <Fields.Price control={form.control} name="ocoPrice" />
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopSizeOverride
                  control={form.control}
                  name="ocoSizeOverride"
                />
              </FieldControls>
              <Fields.StopSize control={form.control} name="ocoSize" />
            </div>
          </>
        )}
        <SubmitButton
          text={t('Place limit stop order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ ${price} ${
            ticket.quoteAsset.symbol
          }`}
        />

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
