import { z } from 'zod';
import { OrderType, OrderTimeInForce, Side } from '@vegaprotocol/types';

export const numericalString = z.string().refine(
  (v) => {
    const n = Number(v);

    if (v?.length <= 0) return false;
    if (isNaN(n)) return false;
    if (n <= 0) return false;

    return true;
  },
  { message: 'Invalid number' }
);

export const schemaMarket = z
  .object({
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

export type FormFieldsMarket = z.infer<typeof schemaMarket>;
export type FormFieldsLimit = z.infer<typeof schemaLimit>;
