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
import { getBaseQuoteUnit } from '@vegaprotocol/deal-ticket';

export const TicketMarket = (props: FormProps) => {
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);

  const { market } = useTicketContext();
  const instrument = market.tradableInstrument.instrument;
  const baseQuote = getBaseQuoteUnit(instrument.metadata.tags);

  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      mode: 'size',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '', // or notional
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      tpSl: false,
      reduceOnly: false,
    },
  });

  const { data: marketPrice } = useMarketPrice(props.market.id);

  const tpSl = form.watch('tpSl');
  const price = marketPrice
    ? toBigNum(marketPrice, props.market.decimalPlaces)
    : undefined;

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          // if in notional, convert back to normal size
          const size =
            fields.mode === 'notional'
              ? helpers.toSize(BigNumber(fields.size), price || BigNumber(0))
              : fields.size;

          console.log({
            marketId: props.market.id,
            type: fields.type,
            side: fields.side,
            timeInForce: fields.timeInForce,
            size: removeDecimal(size, props.market.positionDecimalPlaces),
          });

          return;
          create({
            orderSubmission: {},
          });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        <Fields.Size
          control={form.control}
          price={price}
          label={
            <>
              <span className="text-default">{t('Size')}</span> {baseQuote}
            </>
          }
        />
        <SizeSlider
          market={props.market}
          asset={props.asset}
          balances={props.balances}
        />
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
        <TradingButton intent={Intent.Secondary} size="large" type="submit">
          Submit
        </TradingButton>
        <Datagrid>
          <Data.Notional price={price} />
        </Datagrid>
        <pre className="block w-full text-2xs">
          {JSON.stringify(
            { marketPrice: marketPrice || '0', ...form.getValues() },
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
