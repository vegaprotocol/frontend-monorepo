import BigNumber from 'bignumber.js';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';
import { removeDecimal, toBigNum } from '@vegaprotocol/utils';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { Form, FormGrid, FormGridCol } from '../elements/form';
import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-perp';
import { SizeSlider } from '../size-slider';

import * as helpers from '../helpers';
import * as Fields from '../fields';
import * as Data from '../info';
import { useMarketPrice } from '@vegaprotocol/markets';
import { Datagrid } from '../elements/datagrid';

import { useTicketContext } from '../ticket-context';
import { SubmitButton } from '../elements/submit-button';

export const TicketMarket = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);

  const ticket = useTicketContext();

  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '', // or notional
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      tpSl: false,
      reduceOnly: false,
    },
  });

  const { data: marketPrice } = useMarketPrice(ticket.market.id);

  const type = form.watch('type');
  const size = form.watch('size');
  const tpSl = form.watch('tpSl');

  const price =
    marketPrice !== undefined && marketPrice !== null
      ? toBigNum(marketPrice, ticket.market.decimalPlaces)
      : undefined;

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          // if in notional, convert back to normal size
          const size =
            fields.sizeMode === 'notional'
              ? helpers.toSize(BigNumber(fields.size), price || BigNumber(0))
              : fields.size;

          console.log({
            marketId: ticket.market.id,
            type: fields.type,
            side: fields.side,
            timeInForce: fields.timeInForce,
            size: removeDecimal(size, ticket.market.positionDecimalPlaces),
          });

          return;
          create({
            orderSubmission: {},
          });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        <Fields.Size control={form.control} price={price} />
        <SizeSlider />
        <FormGrid>
          <FormGridCol>
            <Fields.TpSl control={form.control} />
            <Fields.ReduceOnly control={form.control} />
          </FormGridCol>
          <FormGridCol>
            <Fields.TimeInForce control={form.control} />
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
        <SubmitButton
          text={t(
            type === OrderType.TYPE_MARKET
              ? 'Place market order'
              : 'Place limit order'
          )}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
        />
        <Datagrid>
          <Data.Notional />
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
