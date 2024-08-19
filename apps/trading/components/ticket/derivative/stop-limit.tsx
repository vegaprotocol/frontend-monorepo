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
import { useVegaWallet } from '@vegaprotocol/wallet-react';

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
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';

import { FeedbackStop } from './feedback-stop';
import BigNumber from 'bignumber.js';

import * as Fields from '../fields';
import * as Data from '../info';
import * as utils from '../utils';
import { Datagrid } from '../elements/datagrid';

export const StopLimit = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((store) => store.create);
  const ticket = useTicketContext('default');

  const { pubKey } = useVegaWallet();

  const schema = useStopLimitSchema(ticket.market);
  const form = useForm<FormFieldsStopLimit>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'stopLimit',
      type: OrderType.TYPE_LIMIT,
      sizeMode: 'contracts',
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      postOnly: false,
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
  const oco = form.watch('oco');
  const ocoTif = form.watch('ocoTimeInForce');
  const sizeOverride = form.watch('sizeOverride');
  const ocoSizeOverride = form.watch('ocoSizeOverride');

  const _price = form.watch('price');
  const _ocoPrice = form.watch('ocoPrice');
  const price = BigNumber(_price || 0);
  const ocoPrice = BigNumber(_ocoPrice || 0);

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
                <FormGridCol>
                  {ocoTif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
                    <Fields.ExpiresAt name="ocoExpiresAt" />
                  )}
                </FormGridCol>
              </FormGrid>
              <FormGrid>
                <Fields.ReduceOnly disabled />
              </FormGrid>
            </AdvancedControls>
          </>
        )}
        <hr className="border-gs-300 dark:border-gs-700" />
        <Fields.StopExpiry />
        <FeedbackStop />
        <SubmitButton text={t('Place limit stop order')} />
        <Datagrid heading={<Data.StopSummary />}>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
        </Datagrid>
        {oco && (
          <>
            <hr className="border-gs-300 dark:border-gs-700" />
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
