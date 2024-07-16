import { z } from 'zod';
import {
  OrderType,
  OrderTimeInForce,
  Side,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
  StopOrderExpiryStrategy,
} from '@vegaprotocol/types';
import { isBefore } from 'date-fns';
import { getProductType, type MarketInfo } from '@vegaprotocol/markets';
import { determinePriceStep, determineSizeStep } from '@vegaprotocol/utils';

export const createMarketSchema = (market: MarketInfo) => {
  const sizeStep = determineSizeStep(market);

  return z
    .object({
      ticketType: z.literal('market'),
      sizeMode: z.enum(['contracts', 'notional']),
      type: z.literal(OrderType.TYPE_MARKET),
      side: z.nativeEnum(Side),
      size: z.coerce.number().min(Number(sizeStep)).step(Number(sizeStep)),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      tpSl: z.boolean(),
      reduceOnly: z.boolean(),
      takeProfit: z.coerce.number().optional(),
      stopLoss: z.coerce.number().optional(),
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
          path: ['timeInForce'],
        });
      }

      if (val.tpSl && !val.takeProfit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a take profit price',
          path: ['takeProfit'],
        });
      }

      if (val.tpSl && !val.stopLoss) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a stop loss price',
          path: ['stopLoss'],
        });
      }
    });
};

export const createLimitSchema = (market: MarketInfo) => {
  const sizeStep = determineSizeStep(market);
  const priceStep = determinePriceStep(market);

  return z
    .object({
      ticketType: z.literal('limit'),
      sizeMode: z.enum(['contracts', 'notional']),
      type: z.literal(OrderType.TYPE_LIMIT),
      side: z.nativeEnum(Side),
      price: z.coerce.number().min(Number(priceStep)).step(Number(priceStep)),
      size: z.coerce.number().min(Number(sizeStep)).step(Number(sizeStep)),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      expiresAt: z.date().optional(),
      tpSl: z.boolean(),
      reduceOnly: z.boolean(),
      postOnly: z.boolean(),
      takeProfit: z.coerce.number().optional(),
      stopLoss: z.coerce.number().optional(),
      iceberg: z.boolean(),
      icebergPeakSize: z.coerce.number().optional(),
      icebergMinVisibleSize: z.coerce.number().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT) {
        if (!val.expiresAt) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: 'GTT requires a expiry date',
            path: ['expiresAt'],
            fatal: true,
          });

          return z.NEVER;
        }

        if (isBefore(val.expiresAt, new Date())) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: 'GTT must be in the future',
            path: ['expiresAt'],
          });
        }
      }

      if (val.tpSl && !val.takeProfit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a take profit price',
          path: ['takeProfit'],
        });
      }

      if (val.tpSl && !val.stopLoss) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a stop loss price',
          path: ['stopLoss'],
        });
      }

      if (val.iceberg && !val.icebergPeakSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a peak size',
          path: ['icebergPeakSize'],
        });
      }

      if (val.iceberg && !val.icebergMinVisibleSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a min visible size',
          path: ['icebergMinVisibleSize'],
        });
      }
    });
};

export const createStopLimitSchema = (market: MarketInfo) => {
  const type = getProductType(market);
  const sizeStep = determineSizeStep(market);
  const priceStep = determinePriceStep(market);

  return z
    .object({
      ticketType: z.literal('stopLimit'),
      type: z.literal(OrderType.TYPE_LIMIT),
      side: z.nativeEnum(Side),
      triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      triggerType: z.enum(['price', 'trailingPercentOffset']),
      triggerPrice: z.coerce.number(),
      price: z.coerce.number().min(Number(priceStep)).step(Number(priceStep)),
      sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
      size: z.coerce.number().min(Number(sizeStep)).step(Number(sizeStep)),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      expiresAt: z.date().optional(),
      stopExpiry: z.boolean(),
      stopExpiryStrategy: z.nativeEnum(StopOrderExpiryStrategy),
      stopExpiresAt: z.date().optional(),
      reduceOnly: z.boolean(),
      postOnly: z.boolean(),
      oco: z.boolean(),
      ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      ocoTriggerType: z.enum(['price', 'trailingPercentOffset']),
      ocoTriggerPrice: z.coerce.number().optional(),
      ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
      ocoSize: z.coerce
        .number()
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      ocoPrice: z.coerce
        .number()
        .min(Number(priceStep))
        .step(Number(priceStep))
        .optional(),
    })
    .superRefine((val, ctx) => {
      if (val.oco && !val.ocoTriggerPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a OCO trigger price',
          path: ['ocoTriggerPrice'],
        });
      }

      if (val.oco && !val.ocoSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a OCO size',
          path: ['ocoSize'],
        });
      }

      if (val.oco && !val.ocoPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a OCO price',
          path: ['ocoPrice'],
        });
      }

      if (type !== 'Spot') {
        if (!val.reduceOnly) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stop orders on non spot markets must be reduce only',
            path: ['reduceOnly'],
          });
        }
      }
    });
};

export const createStopMarketSchema = (market: MarketInfo) => {
  const type = getProductType(market);
  const sizeStep = determineSizeStep(market);
  const priceStep = determinePriceStep(market);

  return z
    .object({
      ticketType: z.literal('stopMarket'),
      type: z.literal(OrderType.TYPE_MARKET),
      side: z.nativeEnum(Side),
      triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      triggerType: z.enum(['price', 'trailingPercentOffset']),
      triggerPrice: z.coerce.number(),
      sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
      size: z.coerce.number().min(Number(sizeStep)).step(Number(sizeStep)),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      expiresAt: z.date().optional(),
      stopExpiry: z.boolean(),
      stopExpiryStrategy: z.nativeEnum(StopOrderExpiryStrategy),
      stopExpiresAt: z.date().optional(),
      reduceOnly: z.boolean(),
      oco: z.boolean(),
      ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      ocoTriggerType: z.enum(['price', 'trailingPercentOffset']),
      ocoTriggerPrice: z.coerce.number().optional(),
      ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting),
      ocoSize: z.coerce
        .number()
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      ocoPrice: z.coerce
        .number()
        .min(Number(priceStep))
        .step(Number(priceStep))
        .optional(),
    })
    .superRefine((val, ctx) => {
      if (val.oco && !val.ocoTriggerPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a OCO trigger price',
          path: ['ocoTriggerPrice'],
        });
      }

      if (val.oco && !val.ocoSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provide a OCO size',
          path: ['ocoSize'],
        });
      }

      if (type !== 'Spot') {
        if (!val.reduceOnly) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stop orders on non spot markets must be reduce only',
            path: ['reduceOnly'],
          });
        }
      }
    });
};

export type FormFieldsMarket = z.infer<ReturnType<typeof createMarketSchema>>;
export type FormFieldsLimit = z.infer<ReturnType<typeof createLimitSchema>>;
export type FormFieldsStopMarket = z.infer<
  ReturnType<typeof createStopMarketSchema>
>;
export type FormFieldsStopLimit = z.infer<
  ReturnType<typeof createStopLimitSchema>
>;
export type FormFields =
  | FormFieldsMarket
  | FormFieldsLimit
  | FormFieldsStopMarket
  | FormFieldsStopLimit;
export type TicketType = FormFields['ticketType'];
