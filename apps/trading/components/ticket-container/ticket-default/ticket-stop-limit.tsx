import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
} from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { mapFormValuesToStopOrdersSubmission } from '@vegaprotocol/deal-ticket';

import { FieldControls, Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsStopLimit, useStopLimitSchema } from '../schemas';
import { TicketEventUpdater } from '../ticket-events';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';

import * as Fields from '../fields';
import { FeedbackStop } from './feedback-stop';
import { SizeSliderStop } from './size-slider-stop';
import BigNumber from 'bignumber.js';

export const TicketStopLimit = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('default');

  const schema = useStopLimitSchema(ticket.market);
  const form = useForm<FormFieldsStopLimit>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'stopLimit',
      type: OrderType.TYPE_LIMIT,
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: addDays(new Date(), 1),
      postOnly: false,
      reduceOnly: true, // must be reduce only for stop orders (unless spot market)
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
    },
  });

  const size = form.watch('size');
  const price = form.watch('price');
  const tif = form.watch('timeInForce');
  const oco = form.watch('oco');
  const stopExpiry = form.watch('stopExpiry');

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
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
        <Fields.Side side={props.side} onSideChange={props.onSideChange} />
        <TicketTypeSelect type="stopLimit" onTypeChange={props.onTypeChange} />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopTriggerDirection />
            <Fields.StopTriggerType />
          </FieldControls>
          <Fields.StopTriggerPrice />
        </div>
        <Fields.Price />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopSizeOverride />
          </FieldControls>
          <Fields.StopSize />
        </div>
        <SizeSliderStop price={BigNumber(price || '0')} />
        <FormGrid>
          <FormGridCol>
            <Fields.ReduceOnly disabled />
            <Fields.OCO />
            <Fields.StopExpiry />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce />
          </FormGridCol>
        </FormGrid>
        {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && <Fields.ExpiresAt />}
        {stopExpiry && (
          <div className="flex flex-col gap-1">
            <FieldControls>
              <Fields.StopExpiryStrategy />
            </FieldControls>
            <Fields.StopExpiresAt />
          </div>
        )}
        {oco && (
          <>
            <hr className="border-default my-4" />
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopTriggerDirection name="ocoTriggerDirection" />
                <Fields.StopTriggerType name="ocoTriggerType" />
              </FieldControls>
              <Fields.StopTriggerPrice name="ocoTriggerPrice" />
            </div>
            <Fields.Price name="ocoPrice" />
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopSizeOverride name="ocoSizeOverride" />
              </FieldControls>
              <Fields.StopSize name="ocoSize" />
            </div>
          </>
        )}
        <FeedbackStop />
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
