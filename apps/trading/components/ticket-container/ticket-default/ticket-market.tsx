import BigNumber from 'bignumber.js';
import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from '@vegaprotocol/deal-ticket';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useMarkPrice } from '@vegaprotocol/markets';

import { useT } from '../../../lib/use-t';
import { Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { SizeSlider } from './size-slider';

import * as utils from '../utils';
import * as Fields from '../fields';
import * as Data from '../info';
import { TicketEventUpdater } from '../ticket-events';
import { Datagrid } from '../elements/datagrid';

import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';

export const TicketMarket = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const { pubKey } = useVegaWallet();

  const ticket = useTicketContext('default');

  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      ticketType: 'market',
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '', // or notional
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      reduceOnly: false,
      tpSl: false,
      takeProfit: '',
      stopLoss: '',
    },
  });

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

          // TODO: handle this in the map function using sizeMode
          // if in notional, convert back to normal size
          const size =
            fields.sizeMode === 'notional'
              ? utils
                  .toSize(BigNumber(fields.size), price || BigNumber(0))
                  .toString()
              : fields.size;

          if (fields.tpSl) {
            const batchMarketInstructions =
              mapFormValuesToTakeProfitAndStopLoss(
                {
                  ...fields,
                  size,
                },
                ticket.market,
                reference
              );

            create({
              batchMarketInstructions,
            });
          } else {
            const orderSubmission = mapFormValuesToOrderSubmission(
              {
                ...fields,
                size,
              },
              ticket.market.id,
              ticket.market.decimalPlaces,
              ticket.market.positionDecimalPlaces,
              reference
            );

            create({
              orderSubmission,
            });
          }
        })}
      >
        <Fields.Side />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        <Fields.Size price={price} />
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
            <FormGridCol>
              <Fields.TakeProfit />
            </FormGridCol>
            <FormGridCol>
              <Fields.StopLoss />
            </FormGridCol>
          </FormGrid>
        )}
        <SubmitButton
          text={t('Place market order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
        />
        <Datagrid>
          <Data.Notional price={price} />
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
