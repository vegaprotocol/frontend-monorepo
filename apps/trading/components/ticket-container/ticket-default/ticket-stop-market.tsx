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
import { useMarkPrice } from '@vegaprotocol/markets';
import { toBigNum } from '@vegaprotocol/utils';

import { FieldControls, Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsStopMarket, useStopMarketSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { TicketEventUpdater } from '../ticket-events';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';

import * as Fields from '../fields';

import { SizeSliderStop } from './size-slider-stop';
import { FeedbackStop } from './feedback-stop';
import { createStopOrdersSubmission } from '../map-form-values-to-submission';

export const TicketStopMarket = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('default');

  const schema = useStopMarketSchema(ticket.market);
  const form = useForm<FormFieldsStopMarket>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'stopMarket',
      type: OrderType.TYPE_MARKET,
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: addDays(new Date(), 1),
      reduceOnly: true, // must be reduce only for stop orders (unless spot market)
      stopExpiry: false,
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
    },
  });

  const size = form.watch('size');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);
  const oco = form.watch('oco');
  const stopExpiry = form.watch('stopExpiry');

  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const price =
    markPrice && markPrice !== null
      ? toBigNum(markPrice, ticket.market.decimalPlaces)
      : undefined;

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          create({
            // TODO: convert this func to take the schema values
            stopOrdersSubmission: createStopOrdersSubmission(
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
        <TicketTypeSelect type="stopMarket" onTypeChange={props.onTypeChange} />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopTriggerDirection />
            <Fields.StopTriggerType />
          </FieldControls>
          <Fields.StopTriggerPrice />
        </div>
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopSizeOverride />
          </FieldControls>
          <Fields.StopSize />
        </div>
        <SizeSliderStop price={price} />
        <FormGrid>
          <FormGridCol>
            {isPersistent ? (
              <Fields.PostOnly />
            ) : (
              <Fields.ReduceOnly disabled />
            )}
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
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
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
