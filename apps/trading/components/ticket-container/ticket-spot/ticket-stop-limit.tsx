import { FormProvider, useForm } from 'react-hook-form';
import uniqueId from 'lodash/uniqueId';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
  StopOrderExpiryStrategy,
} from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

import {
  AdvancedControls,
  FieldControls,
  Form,
  FormGrid,
  FormGridCol,
} from '../elements/form';
import { type FormFieldsStopLimit, useStopLimitSchema } from '../schemas';
import { TicketEventUpdater } from '../ticket-events';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import { SizeSliderStop } from './size-slider-stop';
import BigNumber from 'bignumber.js';

import * as Fields from '../fields';
import * as utils from '../utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { FeedbackStop } from './feedback-stop';

export const TicketStopLimit = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('spot');

  const { pubKey } = useVegaWallet();

  const schema = useStopLimitSchema(ticket.market);
  const form = useForm<FormFieldsStopLimit>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'stopLimit',
      type: OrderType.TYPE_LIMIT,
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: addDays(new Date(), 1),
      postOnly: false,
      reduceOnly: false,
      stopExpiryStrategy: StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED,
      oco: false,
      ocoType: OrderType.TYPE_MARKET,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  });

  const size = form.watch('size');
  const price = form.watch('price');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);
  const oco = form.watch('oco');
  const ocoTif = form.watch('ocoTimeInForce');

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          create({
            stopOrdersSubmission: utils.createStopLimitOrder(
              fields,
              ticket.market,
              reference
            ),
          });
        })}
      >
        <Fields.Side side={props.side} onSideChange={props.onSideChange} />
        <TicketTypeSelect type="stopLimit" onTypeChange={props.onTypeChange} />
        <div className="flex flex-col gap-1">
          <FieldControls>
            <div className="mr-auto">
              <Fields.OCO />
            </div>
            <Fields.StopTriggerDirection />
            <Fields.StopTriggerType />
          </FieldControls>
          <Fields.StopTriggerPrice />
        </div>
        <Fields.StopSize />
        <Fields.Price />
        <SizeSliderStop price={BigNumber(price || '0')} />
        <AdvancedControls>
          <FormGrid>
            <FormGridCol>
              <Fields.TimeInForce />
            </FormGridCol>
            <FormGridCol>
              {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
                <Fields.ExpiresAt />
              )}
            </FormGridCol>
          </FormGrid>
          <div>
            {isPersistent ? <Fields.PostOnly /> : <Fields.ReduceOnly />}
          </div>
        </AdvancedControls>
        {oco && (
          <>
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopTriggerDirection name="ocoTriggerDirection" />
                <Fields.StopTriggerType name="ocoTriggerType" />
              </FieldControls>
              <Fields.StopTriggerPrice name="ocoTriggerPrice" />
            </div>
            <Fields.StopSize name="ocoSize" />
            <Fields.Price name="ocoPrice" />
            <AdvancedControls>
              <FormGrid>
                <FormGridCol>
                  <Fields.TimeInForce name="ocoTimeInForce" />
                </FormGridCol>
                <FormGridCol>
                  {ocoTif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
                    <Fields.ExpiresAt name="ocoExpiresAt" />
                  )}
                </FormGridCol>
              </FormGrid>
            </AdvancedControls>
          </>
        )}
        <hr className="border-default" />
        <Fields.StopExpiry />
        <FeedbackStop />
        <SubmitButton
          text={t('Place limit stop order')}
          subLabel={`${size || 0} ${ticket.baseAsset.symbol} @ ${price} ${
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
