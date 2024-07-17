import BigNumber from 'bignumber.js';
import { useState } from 'react';
import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import { OrderType, OrderTimeInForce } from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from '@vegaprotocol/deal-ticket';

import { Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsLimit, createLimitSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import { Datagrid } from '../elements/datagrid';
import { TicketEventUpdater } from '../ticket-events';

import * as Fields from '../fields';
import * as Data from '../info';
import { SizeSlider } from './size-slider';
import { Feedback } from './feedback';

export const TicketLimit = (props: FormProps) => {
  const ticket = useTicketContext('spot');
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);

  const { pubKey } = useVegaWallet();

  const [schema] = useState(createLimitSchema(ticket.market));
  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'limit',
      sizeMode: 'contracts',
      type: OrderType.TYPE_LIMIT,
      side: props.side,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: addDays(new Date(), 1),
      postOnly: false,
      reduceOnly: false,
      iceberg: false,
      tpSl: false,
    },
  });

  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');
  const price = form.watch('price');
  const tpSl = form.watch('tpSl');
  const iceberg = form.watch('iceberg');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);

  return (
    <FormProvider {...form}>
      <TicketEventUpdater />
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          if (fields.tpSl) {
            const batchMarketInstructions =
              mapFormValuesToTakeProfitAndStopLoss(
                fields,
                ticket.market,
                reference
              );

            create({
              batchMarketInstructions,
            });
          } else {
            const orderSubmission = mapFormValuesToOrderSubmission(
              fields,
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
        <Fields.Side side={props.side} onSideChange={props.onSideChange} />
        <TicketTypeSelect type="limit" onTypeChange={props.onTypeChange} />
        <Fields.Price />
        {sizeMode === 'contracts' ? (
          <Fields.Size price={BigNumber(price || 0)} />
        ) : (
          <Fields.Notional price={BigNumber(price || 0)} />
        )}
        <SizeSlider price={BigNumber(price || '0')} />
        <FormGrid>
          <FormGridCol>
            <Fields.TpSl />
            {isPersistent ? (
              <>
                <Fields.PostOnly />
                <Fields.Iceberg />
              </>
            ) : (
              <Fields.ReduceOnly />
            )}
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce />
            {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && <Fields.ExpiresAt />}
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
        {iceberg && (
          <FormGrid>
            <FormGridCol>
              <Fields.IcebergPeakSize />
            </FormGridCol>
            <FormGridCol>
              <Fields.IcebergMinVisibleSize />
            </FormGridCol>
          </FormGrid>
        )}
        <Feedback />
        <SubmitButton
          text={t('Place limit order')}
          subLabel={`${size || 0} ${ticket.baseAsset.symbol} @ ${price} ${
            ticket.quoteAsset.symbol
          }`}
        />
        <Datagrid>
          {sizeMode === 'contracts' ? <Data.Notional /> : <Data.Size />}
          <Data.Fees />
          <Data.Slippage />
          <Data.CollateralRequired />
        </Datagrid>

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
