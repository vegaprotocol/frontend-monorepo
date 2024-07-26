import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLastTradePrice } from '@vegaprotocol/markets';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

import { useT } from '../../../lib/use-t';
import { SubmitButton } from '../elements/submit-button';
import {
  AdvancedControls,
  Form,
  FormGrid,
  FormGridCol,
} from '../elements/form';
import { type FormFieldsMarket, useMarketSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { useTicketContext } from '../ticket-context';
import { TicketEventUpdater } from '../ticket-events';
import { Feedback } from './feedback';
import { Datagrid } from '../elements/datagrid';

import * as Fields from '../fields';
import * as SpotFields from './fields';
import * as Data from '../info';
import * as utils from '../utils';

export const Market = (props: FormProps) => {
  const ticket = useTicketContext('spot');
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const { pubKey } = useVegaWallet();

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

  const { data: lastTradePrioce } = useLastTradePrice(ticket.market.id);
  const price =
    lastTradePrioce && lastTradePrioce !== null
      ? toBigNum(lastTradePrioce, ticket.market.decimalPlaces)
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
          <SpotFields.Size price={price} />
        ) : (
          <SpotFields.Notional price={price} />
        )}
        <SpotFields.SizeSlider price={price} />
        <AdvancedControls>
          <div>
            <Fields.TimeInForce />
          </div>
          <div>
            <Fields.ReduceOnly />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Fields.TakeProfitStopLoss />
            {tpSl && (
              <FormGrid className="pl-4">
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
        <SubmitButton
          text={t('Place market order')}
          subLabel={`${size || 0} ${ticket.baseAsset.symbol} @ market`}
        />
        <Datagrid>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
          <Data.Slippage />
          <Data.CollateralRequired />
        </Datagrid>
      </Form>
    </FormProvider>
  );
};
