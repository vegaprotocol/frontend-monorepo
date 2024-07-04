import BigNumber from 'bignumber.js';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type MarketInfo, useMarkPrice } from '@vegaprotocol/markets';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { Side } from '@vegaprotocol/types';
import { determineSizeStep, toBigNum } from '@vegaprotocol/utils';

import { type FormFieldsMarket, schemaMarket } from '../schemas';
import { Form } from '../elements/form';
import * as Fields from '../fields';
import { TicketTypeSelect } from '../ticket-type-select';
import { type FormProps } from '../ticket-spot';
import { Slider } from '../slider';
import { useState } from 'react';

export const TicketMarket = (props: FormProps) => {
  const [mode, setMode] = useState<'size' | 'notional'>('size');
  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      side: Side.SIDE_BUY,
      size: '',
    },
  });
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
        {mode === 'size' ? (
          <Fields.Size
            control={form.control}
            appendElement={
              <button
                className="flex justify-center items-center bg-vega-clight-400 dark:bg-vega-cdark-400 p-2 rounded"
                type="button"
                onClick={() => console.log('here')}
              >
                <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
              </button>
            }
          />
        ) : (
          <Fields.Size
            control={form.control}
            appendElement={
              <button
                className="flex justify-center items-center bg-vega-clight-400 dark:bg-vega-cdark-400 p-2 rounded"
                type="button"
                onClick={() => console.log('here')}
              >
                <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
              </button>
            }
          />
        )}
        <SizeSlider
          market={props.market}
          balances={props.balances}
          baseAsset={props.baseAsset}
          quoteAsset={props.quoteAsset}
        />
        <TradingButton intent={Intent.Secondary} size="large" type="submit">
          Submit
        </TradingButton>
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
export const SizeSlider = ({
  market,
  balances,
  baseAsset,
  quoteAsset,
}: {
  market: MarketInfo;
  balances: { base: string; quote: string };
  baseAsset: AssetFieldsFragment;
  quoteAsset: AssetFieldsFragment;
}) => {
  const form = useFormContext();
  const { data: markPrice } = useMarkPrice(market.id);

  const side = form.watch('side');

  if (!markPrice) return null;
  if (!market.fees.factors) return null;

  const feeFactors = market.fees.factors;

  return (
    <Slider
      min={0}
      max={100}
      defaultValue={[0]}
      onValueCommit={(value) => {
        let max = new BigNumber(0);

        if (side === Side.SIDE_BUY) {
          max = toBigNum(balances.quote, quoteAsset.decimals).div(
            toBigNum(markPrice, market.decimalPlaces)
          );
        } else if (side === Side.SIDE_SELL) {
          max = toBigNum(balances.base, baseAsset.decimals);
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
              positionDecimalPlaces: market.positionDecimalPlaces,
            })
          )
        );

        const size = new BigNumber(value[0]).div(100).times(max);

        form.setValue('size', size.toString(), { shouldValidate: true });
      }}
    />
  );
};
