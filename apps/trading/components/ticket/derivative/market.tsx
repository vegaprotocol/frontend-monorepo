import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce } from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useMarkPrice } from '@vegaprotocol/markets';
import { toBigNum } from '@vegaprotocol/utils';

import { useT } from '../../../lib/use-t';
import {
  AdvancedControls,
  Form,
  FormGrid,
  FormGridCol,
} from '../elements/form';
import { type FormFieldsMarket, useMarketSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';

import { TicketEventUpdater } from '../ticket-events';
import { Datagrid } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { Feedback } from './feedback';
import * as Fields from '../fields';
import * as Data from '../info';
import * as utils from '../utils';

export const Market = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const { pubKey } = useVegaWallet();

  const ticket = useTicketContext('default');

  const schema = useMarketSchema(ticket.market);
  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'market',
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: props.side,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      reduceOnly: false,
      tpSl: false,
    },
  });

  const sizeMode = form.watch('sizeMode');
  const tpSl = form.watch('tpSl');

  const { data: _markPrice } = useMarkPrice(ticket.market.id);
  const price = _markPrice
    ? toBigNum(_markPrice, ticket.market.decimalPlaces)
    : undefined;

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          if (fields.tpSl) {
            const batchMarketInstructions = utils.createOrderWithTpSl(
              fields,
              ticket.market,
              reference
            );

            create({
              batchMarketInstructions,
            });
          } else {
            const orderSubmission = utils.createMarketOrder(
              fields,
              ticket.market,
              reference
            );

            create({
              orderSubmission,
            });
          }
        })}
      >
        <Fields.Side side={props.side} onSideChange={props.onSideChange} />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        {sizeMode === 'contracts' ? (
          <Fields.Size price={price} />
        ) : (
          <Fields.Notional price={price} />
        )}
        <Fields.SizeSlider price={price} />
        <AdvancedControls>
          <FormGrid>
            <Fields.TimeInForce />
          </FormGrid>
          <FormGrid>
            <Fields.ReduceOnly />
          </FormGrid>
          <div className="flex flex-col items-start gap-1">
            <Fields.TakeProfitStopLoss />
            {tpSl && (
              <FormGrid>
                <FormGridCol>
                  <Fields.TakeProfit />
                </FormGridCol>
                <FormGridCol>
                  <Fields.StopLoss />
                </FormGridCol>
              </FormGrid>
            )}
          </div>
        </AdvancedControls>
        <Feedback />
        <SubmitButton text={t('Place market order')} />
        <Datagrid heading={<Data.Summary />}>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
          <Data.Slippage />
          <Data.CollateralRequired />
          <Data.Liquidation />
        </Datagrid>
      </Form>
    </FormProvider>
  );
};
