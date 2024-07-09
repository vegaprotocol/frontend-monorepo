import BigNumber from 'bignumber.js';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMarkPrice } from '@vegaprotocol/markets';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';

import { useAccountBalance } from '@vegaprotocol/accounts';

import { useT } from '../../../lib/use-t';
import { SubmitButton } from '../elements/submit-button';
import { Form, FormGrid, FormGridCol } from '../elements/form';
import { Slider } from '../slider';
import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-spot';
import { useTicketContext } from '../ticket-context';

import * as Fields from '../fields';

export const TicketMarket = (props: FormProps) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      sizeMode: 'contracts',
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '',
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
      <Form
        onSubmit={form.handleSubmit((fields) => {
          // eslint-disable-next-line no-console
          console.log(fields);
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
          text={t('Place market order')}
          subLabel={`${size || 0} ${ticket.baseSymbol} @ market`}
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
  const ticket = useTicketContext();
  const form = useFormContext();
  const baseAccount = useAccountBalance(ticket.baseAsset?.id);
  const { data: markPrice } = useMarkPrice(ticket.market.id);

  const side = form.watch('side');

  if (!markPrice) return null;
  if (!ticket.market.fees.factors) return null;
  if (!ticket.baseAsset) return null;

  const feeFactors = ticket.market.fees.factors;
  const balances = {
    base: baseAccount.accountBalance,
    quote: ticket.accounts.general,
  };

  return (
    <Slider
      min={0}
      max={100}
      defaultValue={[0]}
      onValueCommit={(value) => {
        if (!ticket.baseAsset || !ticket.quoteAsset) {
          return;
        }

        let max = new BigNumber(0);

        if (side === Side.SIDE_BUY) {
          max = toBigNum(balances.quote, ticket.quoteAsset.decimals).div(
            toBigNum(markPrice, ticket.market.decimalPlaces)
          );
        } else if (side === Side.SIDE_SELL) {
          max = toBigNum(balances.base, ticket.baseAsset.decimals);
        }

        max = max.multipliedBy(
          1 -
            Number(feeFactors.infrastructureFee) -
            Number(feeFactors.liquidityFee) -
            Number(feeFactors.makerFee)
        );

        // round to size step
        max = max.minus(
          max.mod(
            determineSizeStep({
              positionDecimalPlaces: ticket.market.positionDecimalPlaces,
            })
          )
        );

        const size = new BigNumber(value[0]).div(100).times(max);

        form.setValue('size', size.toString(), { shouldValidate: true });
      }}
    />
  );
};
