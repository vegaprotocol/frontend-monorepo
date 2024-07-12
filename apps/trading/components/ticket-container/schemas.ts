import { z } from 'zod';
import {
  OrderType,
  OrderTimeInForce,
  Side,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
} from '@vegaprotocol/types';
import { isBefore } from 'date-fns';

export const numericalString = z.string().refine(
  (v) => {
    const n = Number(v);

    if (isNaN(n)) return false;
    if (n < 0) return false;

    return true;
  },
  { message: 'Invalid number' }
);

export const schemaMarket = z
  .object({
    ticketType: z.literal('market'),
    sizeMode: z.enum(['contracts', 'notional']),
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

export const schemaLimit = z
  .object({
    ticketType: z.literal('limit'),
    sizeMode: z.enum(['contracts', 'notional']),
    type: z.literal(OrderType.TYPE_LIMIT),
    side: z.nativeEnum(Side),
    price: numericalString,
    size: numericalString,
    timeInForce: z.nativeEnum(OrderTimeInForce),
    expiresAt: z.date().optional(),
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
    if (val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT) {
      if (!val.expiresAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: 'GTT requires a expiry date',
          fatal: true,
        });

        return z.NEVER;
      }

      if (isBefore(val.expiresAt, new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: 'GTT requires a expiry date',
        });
      }
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

export const schemaStopLimit = z.object({
  ticketType: z.literal('stopLimit'),
  type: z.literal(OrderType.TYPE_LIMIT),
  side: z.nativeEnum(Side),
  triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
  triggerType: z.enum(['price', 'trailingPercentOffset']),
  trigger: numericalString,
  price: numericalString,
  sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
  size: numericalString,
  timeInForce: z.nativeEnum(OrderTimeInForce),
  expiresAt: z.date().optional(),
  reduceOnly: z.boolean(),
  postOnly: z.boolean(),
  oco: z.boolean(),
  ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection),
  ocoTriggerType: z.enum(['price', 'trailingPercentOffset']),
  ocoTrigger: numericalString,
  ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
  ocoSize: numericalString,
  ocoPrice: numericalString,
});

export const schemaStopMarket = z.object({
  ticketType: z.literal('stopMarket'),
  type: z.literal(OrderType.TYPE_MARKET),
  side: z.nativeEnum(Side),
  triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
  triggerType: z.enum(['price', 'trailingPercentOffset']),
  trigger: numericalString,
  sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
  size: numericalString,
  timeInForce: z.nativeEnum(OrderTimeInForce),
  expiresAt: z.date().optional(),
  reduceOnly: z.boolean(),
  oco: z.boolean(),
  ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection),
  ocoTriggerType: z.enum(['price', 'trailingPercentOffset']),
  ocoTrigger: numericalString,
  ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
  ocoSize: numericalString,
  ocoPrice: numericalString,
});

export type FormFieldsMarket = z.infer<typeof schemaMarket>;
export type FormFieldsLimit = z.infer<typeof schemaLimit>;
export type FormFieldsStopMarket = z.infer<typeof schemaStopMarket>;
export type FormFieldsStopLimit = z.infer<typeof schemaStopLimit>;
export type FormFields =
  | FormFieldsMarket
  | FormFieldsLimit
  | FormFieldsStopMarket
  | FormFieldsStopLimit;
export type TicketType = FormFields['ticketType'];
