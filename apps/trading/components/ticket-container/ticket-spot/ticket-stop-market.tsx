import { FormProvider, useForm } from 'react-hook-form';
import uniqueId from 'lodash/uniqueId';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
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
import { type FormFieldsStopMarket, useStopMarketSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { TicketEventUpdater } from '../ticket-events';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import { SizeSliderStop } from './size-slider-stop';
import { useMarkPrice } from '@vegaprotocol/markets';
import { toBigNum } from '@vegaprotocol/utils';

import * as Fields from '../fields';
import * as utils from '../utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { FeedbackStop } from './feedback-stop';

export const TicketStopMarket = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('spot');

  const { pubKey } = useVegaWallet();

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
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      expiresAt: addDays(new Date(), 1),
      reduceOnly: false,
      stopExpiryStrategy: StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED,
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
    },
  });

  const size = form.watch('size');
  const tif = form.watch('timeInForce');
  const isPersistent = utils.isPersistentTif(tif);
  const oco = form.watch('oco');
  const ocoType = form.watch('ocoType');

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
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          create({
            stopOrdersSubmission: utils.createStopMarketOrder(
              fields,
              ticket.market,
              reference
            ),
          });
        })}
      >
        <Fields.Side side={props.side} onSideChange={props.onSideChange} />
        <TicketTypeSelect type="stopMarket" onTypeChange={props.onTypeChange} />
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
        <div className="flex flex-col gap-1">
          <FieldControls>
            <Fields.StopSizeOverride />
          </FieldControls>
          <Fields.StopSize />
        </div>
        <SizeSliderStop price={price} />
        <AdvancedControls>
          <FormGrid>
            <FormGridCol>
              <Fields.TimeInForce />
            </FormGridCol>
            <FormGridCol />
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
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.OCOType />
                <Fields.StopSizeOverride name="ocoSizeOverride" />
              </FieldControls>
              <Fields.StopSize name="ocoSize" />
            </div>
            {ocoType === OrderType.TYPE_LIMIT && (
              <Fields.Price name="ocoPrice" />
            )}
            <AdvancedControls>
              <FormGrid>
                <FormGridCol>
                  <Fields.TimeInForce name="ocoTimeInForce" />
                </FormGridCol>
                <FormGridCol />
              </FormGrid>
            </AdvancedControls>
          </>
        )}
        <hr className="border-default" />
        <Fields.StopExpiry />
        <FeedbackStop />
        <SubmitButton
          text={t('Place limit stop order')}
          subLabel={`${size || 0} ${ticket.baseAsset.symbol} @ market`}
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
