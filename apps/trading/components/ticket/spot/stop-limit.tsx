import { FormProvider, useForm } from 'react-hook-form';
import uniqueId from 'lodash/uniqueId';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
} from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import {
  AdvancedControls,
  FieldControls,
  Form,
  FormGrid,
} from '../elements/form';
import { type FormFieldsStopLimit, useStopLimitSchema } from '../schemas';
import { TicketEventUpdater } from '../ticket-events';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import BigNumber from 'bignumber.js';

import { FeedbackStop } from './feedback-stop';

import * as Fields from '../fields';
import * as SpotFields from './fields';
import * as utils from '../utils';

export const StopLimit = (props: FormProps) => {
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
      reduceOnly: true,
      stopExpiryStrategy: 'none',
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  });

  const size = form.watch('size');
  const price = form.watch('price');
  const oco = form.watch('oco');
  const ocoPrice = form.watch('ocoPrice');

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          const stopOrdersSubmission = utils.createStopLimitOrder(
            fields,
            ticket.market,
            reference
          );
          create({
            stopOrdersSubmission,
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
        <Fields.Price />
        <SpotFields.StopSize price={BigNumber(price || 0)} />
        <SpotFields.StopSizeSlider price={BigNumber(price || 0)} />
        <AdvancedControls>
          <FormGrid>
            <Fields.TimeInForce />
          </FormGrid>
          <FormGrid>
            <Fields.ReduceOnly disabled />
          </FormGrid>
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
            <Fields.Price name="ocoPrice" />
            <SpotFields.StopSize
              name="ocoSize"
              price={BigNumber(ocoPrice || 0)}
            />
            <SpotFields.StopSizeSlider
              name="ocoSizePct"
              price={BigNumber(price || 0)}
            />
            <AdvancedControls>
              <FormGrid>
                <Fields.TimeInForce name="ocoTimeInForce" />
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
      </Form>
    </FormProvider>
  );
};
