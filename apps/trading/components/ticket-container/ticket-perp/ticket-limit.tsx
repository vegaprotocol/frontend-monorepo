import BigNumber from 'bignumber.js';
import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from '@vegaprotocol/deal-ticket';

import { Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsLimit, schemaLimit } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';
import { useT } from '../../../lib/use-t';
import { Datagrid } from '../elements/datagrid';

import * as helpers from '../helpers';
import * as Fields from '../fields';
import * as Data from '../info';
import { SizeSlider } from '../size-slider';

export const TicketLimit = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const ticket = useTicketContext();

  const { pubKey } = useVegaWallet();

  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schemaLimit),
    defaultValues: {
      sizeMode: 'contracts',
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: '',
      price: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      expiresAt: addDays(new Date(), 1),
      tpSl: false,
      postOnly: false,
      reduceOnly: false,
      iceberg: false,
    },
  });

  const size = form.watch('size');
  const price = form.watch('price');
  const tpSl = form.watch('tpSl');
  const iceberg = form.watch('iceberg');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          const reference = `${pubKey}-${Date.now()}-${uniqueId()}`;

          // TODO: handle this in the map function using sizeMode
          // if in notional, convert back to normal size
          const size =
            fields.sizeMode === 'notional'
              ? helpers
                  .toSize(BigNumber(fields.size), BigNumber(price || 0))
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
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="limit" onTypeChange={props.onTypeChange} />
        <Fields.Price control={form.control} />
        <Fields.Size control={form.control} price={BigNumber(price)} />
        <SizeSlider price={BigNumber(price || '0')} />
        <FormGrid>
          <FormGridCol>
            {isPersistent ? (
              <>
                <Fields.PostOnly control={form.control} />
                <Fields.Iceberg control={form.control} />
              </>
            ) : (
              <Fields.ReduceOnly control={form.control} />
            )}
            <Fields.TpSl control={form.control} />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce control={form.control} />
            {tif === OrderTimeInForce.TIME_IN_FORCE_GTT && (
              <Fields.ExpiresAt control={form.control} />
            )}
          </FormGridCol>
        </FormGrid>
        {tpSl && (
          <FormGrid>
            <FormGridCol>
              <Fields.TakeProfit control={form.control} />
            </FormGridCol>
            <FormGridCol>
              <Fields.StopLoss control={form.control} />
            </FormGridCol>
          </FormGrid>
        )}
        {iceberg && (
          <FormGrid>
            <FormGridCol>
              <Fields.IcebergPeakSize control={form.control} />
            </FormGridCol>
            <FormGridCol>
              <Fields.IcebergMinVisibleSize control={form.control} />
            </FormGridCol>
          </FormGrid>
        )}
        <SubmitButton
          text={t('Place limit order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ ${price} ${
            ticket.quoteAsset.symbol
          }`}
        />
        <Datagrid>
          <Data.Notional price={BigNumber(price)} />
          <Data.Fees />
          <Data.Slippage />
          <Data.CollateralRequired />
          <Data.Liquidation />
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
