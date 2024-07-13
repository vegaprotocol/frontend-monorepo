import BigNumber from 'bignumber.js';
import uniqueId from 'lodash/uniqueId';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMarkPrice } from '@vegaprotocol/markets';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from '@vegaprotocol/deal-ticket';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

import { useT } from '../../../lib/use-t';
import { SubmitButton } from '../elements/submit-button';
import { Form, FormGrid, FormGridCol } from '../elements/form';
import { Slider } from '../slider';
import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-spot';
import { useTicketContext } from '../ticket-context';
import { TicketEventUpdater } from '../ticket-events';
import { useForm as useFormCtx } from '../use-form';

import * as utils from '../utils';
import * as spotUtils from './utils';
import * as Fields from '../fields';
import { useState } from 'react';

export const TicketMarket = (props: FormProps) => {
  const ticket = useTicketContext('spot');
  const t = useT();
  const create = useVegaTransactionStore((state) => state.create);
  const { pubKey } = useVegaWallet();

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
        <SizeSlider />
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
          subLabel={`${size || 0} ${ticket.baseAsset.symbol} @ market`}
        />
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

/**
 * On change of the size slider calculate size
 * based on the sliders percentage value
 */
export const SizeSlider = () => {
  const [pct, setPct] = useState([0]);
  const ticket = useTicketContext('spot');
  const form = useFormCtx('market');

  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const price =
    markPrice && markPrice !== null
      ? toBigNum(markPrice, ticket.market.decimalPlaces)
      : undefined;

  if (!price) return null;

  return (
    <Slider
      min={0}
      max={100}
      step={0.1}
      value={pct}
      onValueChange={(value) => setPct(value)}
      onValueCommit={(value) => {
        setPct(value);
        const fields = form.getValues();
        const max = spotUtils.calcMaxSize({
          side: fields.side,
          price,
          ticket,
        });

        const size = utils.toPercentOf(value[0], max);
        const sizeRounded = utils.roundToPositionDecimals(
          size,
          ticket.market.positionDecimalPlaces
        );

        if (fields.sizeMode === 'contracts') {
          form.setValue('size', sizeRounded.toString(), {
            shouldValidate: true,
          });
        } else if (fields.sizeMode === 'notional') {
          // if in notional mode convert the max size into a notional price
          const notional = utils.toNotional(sizeRounded, price);

          form.setValue('size', notional.toString(), { shouldValidate: true });
        }
      }}
    />
  );
};
