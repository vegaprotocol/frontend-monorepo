import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import * as Fields from './fields';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type MarginMode,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { type TicketType } from './types';
import { TicketTypeSelect } from './ticket-type-select';
import { Form, FormGrid, FormGridCol } from './elements/form';
import { SizeSlider } from './size-slider';
import { NON_PERSISTENT_TIF_OPTIONS } from './constants';
import { type MarketInfo, getAsset } from '@vegaprotocol/markets';
import {
  useAccountBalance,
  useMarginAccountBalance,
  useMarginMode,
} from '@vegaprotocol/accounts';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { removeDecimal } from '@vegaprotocol/utils';

const numericalString = z.string().refine(
  (v) => {
    const n = Number(v);

    if (v?.length <= 0) return false;
    if (isNaN(n)) return false;
    if (n <= 0) return false;

    return true;
  },
  { message: 'Invalid number' }
);

const schemaMarket = z
  .object({
    type: z.literal(OrderType.TYPE_MARKET),
    side: z.nativeEnum(Side),
    size: numericalString,
    timeInForce: z.nativeEnum(OrderTimeInForce),
    tpSl: z.boolean(),
    reduceOnly: z.boolean(),
    takeProfit: numericalString.optional(),
    stopLoss: numericalString.optional(),
  })
  .superRefine((val, ctx) => {
    if (
      val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTC ||
      val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT ||
      val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GFN ||
      val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GFA
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only FOK and IOC orders permitted',
      });
    }

    if (val.tpSl && !val.takeProfit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a take profit price',
      });
    }

    if (val.tpSl && !val.stopLoss) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a stop loss price',
      });
    }
  });

const schemaLimit = z
  .object({
    type: z.literal(OrderType.TYPE_LIMIT),
    side: z.nativeEnum(Side),
    price: numericalString,
    size: numericalString,
    timeInForce: z.nativeEnum(OrderTimeInForce),
    tpSl: z.boolean(),
    reduceOnly: z.boolean(),
    postOnly: z.boolean(),
    takeProfit: numericalString.optional(),
    stopLoss: numericalString.optional(),
    iceberg: z.boolean(),
    icebergPeakSize: numericalString.optional(),
    icebergMinVisibleSize: numericalString.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.tpSl && !val.takeProfit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a take profit price',
      });
    }

    if (val.tpSl && !val.stopLoss) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a stop loss price',
      });
    }

    if (val.iceberg && !val.icebergPeakSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a peak size',
      });
    }

    if (val.iceberg && !val.icebergMinVisibleSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a min visible size',
      });
    }
  });

export const TicketPerp = ({ market }: { market: MarketInfo }) => {
  const [ticketType, setTicketType] = useState<TicketType>('market');
  const { pubKey } = useVegaWallet();
  const asset = getAsset(market);
  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(asset.id);
  const marginMode = useMarginMode({ marketId: market.id, partyId: pubKey });

  const props: FormProps = {
    market,
    onTypeChange: (value: TicketType) => setTicketType(value),
    asset,
    balances: {
      margin: marginAccount.marginAccountBalance,
      general: generalAccount.accountBalance,
    },
    margin: {
      mode: marginMode.data?.marginMode,
      factor: marginMode.data?.marginFactor,
    },
  };

  switch (ticketType) {
    case 'market': {
      return <FormMarket {...props} />;
    }

    case 'limit': {
      return <FormLimit {...props} />;
    }

    case 'stopMarket': {
      // @ts-ignore add props here
      return <FormStopMarket {...props} />;
    }

    case 'stopLimit': {
      // @ts-ignore add props here
      return <FormStopLimit {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};

export type FormFieldsMarket = z.infer<typeof schemaMarket>;

type FormProps = {
  market: MarketInfo;
  asset: AssetFieldsFragment;
  balances: { margin: string; general: string };
  margin: { mode?: MarginMode; factor?: string };
  onTypeChange: (value: TicketType) => void;
};

const FormMarket = (props: FormProps) => {
  const create = useVegaTransactionStore((state) => state.create);

  const form = useForm<FormFieldsMarket>({
    resolver: zodResolver(schemaMarket),
    defaultValues: {
      type: OrderType.TYPE_MARKET,
      side: Side.SIDE_BUY,
      size: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
      tpSl: false,
      reduceOnly: false,
    },
  });

  const tpSl = form.watch('tpSl');

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          create({
            orderSubmission: {
              marketId: props.market.id,
              type: fields.type,
              side: fields.side,
              timeInForce: fields.timeInForce,
              size: removeDecimal(
                fields.size,
                props.market.positionDecimalPlaces
              ),
            },
          });
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="market" onTypeChange={props.onTypeChange} />
        <Fields.Size control={form.control} />
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

export type FormFieldsLimit = z.infer<typeof schemaLimit>;

const FormLimit = (props: FormProps) => {
  const form = useForm<FormFieldsLimit>({
    resolver: zodResolver(schemaLimit),
    defaultValues: {
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: '',
      price: '',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
      tpSl: false,
      postOnly: false,
      reduceOnly: false,
      iceberg: false,
    },
  });

  const tpSl = form.watch('tpSl');
  const iceberg = form.watch('iceberg');
  const tif = form.watch('timeInForce');
  const isPersistent = !NON_PERSISTENT_TIF_OPTIONS.includes(tif);

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit((fields) => {
          console.log(fields);
        })}
      >
        <Fields.Side control={form.control} />
        <TicketTypeSelect type="limit" onTypeChange={props.onTypeChange} />
        <Fields.Size control={form.control} />
        <Fields.Price control={form.control} />
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
        <TradingButton intent={Intent.Secondary} size="large" type="submit">
          Submit
        </TradingButton>
        <pre className="block w-full text-2xs">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </Form>
    </FormProvider>
  );
};

const FormStopMarket = () => {
  return <div>Form stop market</div>;
};

const FormStopLimit = () => {
  return <div>Form stop limit</div>;
};
