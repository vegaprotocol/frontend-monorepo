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
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

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
import { Datagrid } from '../elements/datagrid';
import { useT } from '../../../lib/use-t';
import { useLastTradePrice } from '@vegaprotocol/markets';

import { FeedbackStop } from './feedback-stop';

import * as Fields from '../fields';
import * as Data from '../info';
import * as SpotFields from './fields';
import * as utils from '../utils';

export const StopMarket = (props: FormProps) => {
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
      sizeMode: 'contracts',
      side: props.side,
      triggerDirection: StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      triggerType: 'price',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      expiresAt: addDays(new Date(), 1),
      reduceOnly: true,
      stopExpiryStrategy: 'none',
      oco: false,
      ocoTriggerDirection:
        StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
      ocoTriggerType: 'price',
      ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
  });

  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');
  const oco = form.watch('oco');

  const { data: lastTradedPrice } = useLastTradePrice(ticket.market.id);
  const price =
    lastTradedPrice && lastTradedPrice !== null
      ? toBigNum(lastTradedPrice, ticket.market.decimalPlaces)
      : undefined;

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
        {sizeMode === 'contracts' ? (
          <SpotFields.StopSize price={price} />
        ) : (
          <SpotFields.Notional price={price} />
        )}
        <SpotFields.StopSizeSlider price={price} />
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
            {sizeMode === 'contracts' ? (
              <SpotFields.StopSize name="ocoSize" price={price} />
            ) : (
              <SpotFields.Notional name="ocoNotional" price={price} />
            )}
            <SpotFields.StopSizeSlider name="ocoSizePct" price={price} />
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
        <Datagrid>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
        </Datagrid>
        {oco && (
          <>
            <hr className="border-default" />
            <Datagrid>
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
