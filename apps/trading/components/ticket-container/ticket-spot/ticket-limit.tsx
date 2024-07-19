import BigNumber from 'bignumber.js';
import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce } from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import {
  AdvancedControls,
  Form,
  FormGrid,
  FormGridCol,
} from '../elements/form';
import { type FormFieldsLimit, useLimitSchema } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from './ticket';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import { Datagrid } from '../elements/datagrid';
import { TicketEventUpdater } from '../ticket-events';
import { SizeSlider } from './size-slider';
import { Feedback } from './feedback';

import * as Fields from '../fields';
import * as Data from '../info';
import * as utils from '../utils';

export const TicketLimit = (props: FormProps) => {
  const ticket = useTicketContext('spot');
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);

  const { pubKey } = useVegaWallet();

  const schema = useLimitSchema(ticket.market);
  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticketType: 'limit',
      sizeMode: 'contracts',
      type: OrderType.TYPE_LIMIT,
      side: props.side,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: undefined,
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
            const orderSubmission = utils.createLimitOrder(
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
        <TicketTypeSelect type="limit" onTypeChange={props.onTypeChange} />
        <Fields.Price />
        {sizeMode === 'contracts' ? (
          <Fields.Size price={BigNumber(price || 0)} />
        ) : (
          <Fields.Notional price={BigNumber(price || 0)} />
        )}
        <SizeSlider price={BigNumber(price || '0')} />
        <AdvancedControls>
          <FormGrid>
            <FormGridCol>
              <Fields.TimeInForce />
            </FormGridCol>
            <FormGridCol>
              {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
                <Fields.ExpiresAt />
              )}
            </FormGridCol>
          </FormGrid>
          <div>
            <Fields.PostOnly />
          </div>
          <div>
            <Fields.ReduceOnly />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Fields.Iceberg />
            {iceberg && (
              <FormGrid className="pl-4">
                <FormGridCol>
                  <Fields.IcebergPeakSize />
                </FormGridCol>
                <FormGridCol>
                  <Fields.IcebergMinVisibleSize />
                </FormGridCol>
              </FormGrid>
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <Fields.TpSl />
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
