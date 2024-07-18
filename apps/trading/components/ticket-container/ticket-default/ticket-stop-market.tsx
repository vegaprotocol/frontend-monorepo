import { FormProvider, useForm } from 'react-hook-form';
import uniqueId from 'lodash/uniqueId';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
  StopOrderExpiryStrategy,
} from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useMarkPrice } from '@vegaprotocol/markets';
import { toBigNum } from '@vegaprotocol/utils';

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

import * as Fields from '../fields';
import * as utils from '../utils';

import { SizeSliderStop } from './size-slider-stop';
import { FeedbackStop } from './feedback-stop';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { TradingInputError } from '@vegaprotocol/ui-toolkit';

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
      reduceOnly: true, // must be reduce only for stop orders (unless spot market)
      oco: false,
      ocoType: OrderType.TYPE_MARKET,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
      ocoTriggerType: 'price',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  });

  const size = form.watch('size');
  const oco = form.watch('oco');
  const ocoType = form.watch('ocoType');
  const stopExpiryStrategy = form.watch('stopExpiryStrategy');

  const { pubKey } = useVegaWallet();

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
            <Fields.ReduceOnly disabled />
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
              <div>
                <Fields.ReduceOnly disabled />
              </div>
            </AdvancedControls>
          </>
        )}
        <hr className="border-default" />
        <div>
          <FormGrid>
            <FormGridCol>
              <Fields.StopExpiryStrategy />
            </FormGridCol>
            <FormGridCol>
              {stopExpiryStrategy !==
                StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED && (
                <Fields.StopExpiresAt />
              )}
            </FormGridCol>
          </FormGrid>
          {form.formState.errors.stopExpiresAt && (
            <TradingInputError>
              {form.formState.errors.stopExpiresAt.message}
            </TradingInputError>
          )}
        </div>
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
