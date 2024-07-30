import { FormProvider, useForm } from 'react-hook-form';
import uniqueId from 'lodash/uniqueId';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  OrderType,
  OrderTimeInForce,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
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

import * as Fields from '../fields';
import * as Data from '../info';
import * as utils from '../utils';

import { FeedbackStop } from './feedback-stop';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Datagrid } from '../elements/datagrid';
import BigNumber from 'bignumber.js';

export const StopMarket = (props: FormProps) => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('default');

  const schema = useStopMarketSchema(ticket.market);
  const form = useForm<FormFieldsStopMarket>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'stopMarket',
      type: OrderType.TYPE_MARKET,
      sizeMode: 'contracts',
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      reduceOnly: true, // must be reduce only for stop orders (unless spot market)
      stopExpiryStrategy: 'none',
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
      ocoTriggerType: 'price',
      ocoSizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  });

  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');
  const oco = form.watch('oco');
  const sizeOverride = form.watch('sizeOverride');
  const ocoSizeOverride = form.watch('ocoSizeOverride');

  const triggerType = form.watch('triggerType');
  const ocoTriggerType = form.watch('ocoTriggerType');
  const _price = form.watch('triggerPrice');
  const _ocoPrice = form.watch('ocoTriggerPrice');
  const price = triggerType === 'price' ? BigNumber(_price || 0) : undefined;
  const ocoPrice =
    ocoTriggerType === 'price' ? BigNumber(_ocoPrice || 0) : undefined;

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;
          const stopOrdersSubmission = utils.createStopMarketOrder(
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
            <Fields.StopSizeOverride price={price} />
          </FieldControls>
          {sizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION ? (
            <Fields.StopSizePosition />
          ) : (
            <>
              {sizeMode === 'contracts' ? (
                <Fields.StopSize price={price} />
              ) : (
                <Fields.Notional price={price} />
              )}
            </>
          )}
        </div>
        <Fields.StopSizeSlider price={price} />
        <AdvancedControls>
          <FormGrid>
            <FormGridCol>
              <Fields.TimeInForce />
            </FormGridCol>
            <FormGridCol />
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
            <div className="flex flex-col gap-1">
              <FieldControls>
                <Fields.StopSizeOverride
                  name="ocoSizeOverride"
                  price={ocoPrice}
                />
              </FieldControls>
              {ocoSizeOverride ===
              StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION ? (
                <Fields.StopSizePosition name="ocoSizePosition" />
              ) : (
                <>
                  {sizeMode === 'contracts' ? (
                    <Fields.StopSize name="ocoSize" price={ocoPrice} />
                  ) : (
                    <Fields.Notional name="ocoNotional" price={ocoPrice} />
                  )}
                </>
              )}
            </div>
            <Fields.StopSizeSlider name="ocoSizePct" price={ocoPrice} />
            <AdvancedControls>
              <FormGrid>
                <FormGridCol>
                  <Fields.TimeInForce name="ocoTimeInForce" />
                </FormGridCol>
                <FormGridCol />
              </FormGrid>
              <FormGrid>
                <Fields.ReduceOnly disabled />
              </FormGrid>
            </AdvancedControls>
          </>
        )}
        <hr className="border-default" />
        <Fields.StopExpiry />
        <FeedbackStop />
        <SubmitButton
          text={t('Place limit stop order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
        />
        <Datagrid heading={<Data.StopSummary />}>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
        </Datagrid>
        {oco && (
          <>
            <hr className="border-default" />
            <Datagrid heading={<Data.StopSummary oco />}>
              {sizeMode === 'contracts' ? (
                <Data.Notional name="ocoNotional" />
              ) : (
                <Data.Size name="ocoSize" />
              )}
              <Data.Fees oco />
            </Datagrid>
          </>
        )}
      </Form>
    </FormProvider>
  );
};
