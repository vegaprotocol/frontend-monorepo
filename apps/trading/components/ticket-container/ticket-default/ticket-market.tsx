import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useMarkPrice } from '@vegaprotocol/markets';

import { useT } from '../../../lib/use-t';
import { Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsMarket, useMarketSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { SizeSlider } from './size-slider';

import { TicketEventUpdater } from '../ticket-events';
import { Datagrid } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { Feedback } from './feedback';
import * as Fields from '../fields';
import * as Data from '../info';
import * as utils from '../utils';

export const TicketMarket = (props: FormProps) => {
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
  const size = form.watch('size');
  const tpSl = form.watch('tpSl');

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
        <SizeSlider price={price} />
        <FormGrid>
          <FormGridCol>
            <Fields.TpSl />
            <Fields.ReduceOnly />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce />
          </FormGridCol>
        </FormGrid>
        {tpSl && (
          <FormGrid>
            <FormGridCol className="block">
              <Fields.TakeProfit />
            </FormGridCol>
            <FormGridCol className="block">
              <Fields.StopLoss />
            </FormGridCol>
          </FormGrid>
        )}
        <Feedback />
        <SubmitButton
          text={t('Place market order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
        />
        <Datagrid>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
          <Data.Slippage />
          <Data.CollateralRequired />
          <Data.Liquidation />
        </Datagrid>
        <pre className="block w-full text-2xs">
          {JSON.stringify(
            { marketPrice: price?.toString(), ...form.getValues() },
            null,
            2
          )}
        </pre>
        <pre className="block w-full text-2xs">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </Form>
    </FormProvider>
  );
};
