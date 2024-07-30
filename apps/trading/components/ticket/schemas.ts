import { z } from 'zod';
import {
  OrderType,
  OrderTimeInForce,
  Side,
  StopOrderTriggerDirection,
  StopOrderSizeOverrideSetting,
} from '@vegaprotocol/types';
import { isBefore } from 'date-fns';
import { getProductType, type MarketInfo } from '@vegaprotocol/markets';
import { determinePriceStep, determineSizeStep } from '@vegaprotocol/utils';
import { useMemo } from 'react';
import i18n from '../../lib/i18n';

const sizeMode = z.enum(['contracts', 'notional']);

export const createMarketSchema = (market: MarketInfo) => {
  const sizeStep = determineSizeStep(market);

  return z
    .object({
      ticketType: z.literal('market'),
      sizeMode,
      type: z.literal(OrderType.TYPE_MARKET),
      side: z.nativeEnum(Side),
      size: z.coerce
        .number({ message: i18n.t('Required') })
        .min(Number(sizeStep))
        .step(Number(sizeStep)),
      sizePct: z.number().optional(),
      notional: z.coerce.number(),
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
          message: i18n.t('Only FOK and IOC orders permitted'),
          path: ['timeInForce'],
        });
      }

      if (val.tpSl && !val.takeProfit && !val.stopLoss) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide either a take profit or stop loos price'),
          path: ['takeProfit'],
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
      sizeMode,
      type: z.literal(OrderType.TYPE_LIMIT),
      side: z.nativeEnum(Side),
      price: z.coerce
        .number({ message: i18n.t('Required') })
        .min(Number(priceStep))
        .step(Number(priceStep)),
      size: z.coerce
        .number({ message: i18n.t('Required') })
        .min(Number(sizeStep))
        .step(Number(sizeStep)),
      sizePct: z.number().optional(),
      notional: z.coerce.number(),
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
            message: i18n.t('GTT requires a expiry date'),
            path: ['expiresAt'],
            fatal: true,
          });

          return z.NEVER;
        }

        if (isBefore(val.expiresAt, Date.now())) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: i18n.t('Expiry must be in the future'),
            path: ['expiresAt'],
          });
        }
      }

      if (val.tpSl && !val.takeProfit && !val.stopLoss) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide either a take profit or stop loos price'),
          path: ['takeProfit'],
        });
      }

      if (val.iceberg && !val.icebergPeakSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide a peak size'),
          path: ['icebergPeakSize'],
        });
      }

      if (val.iceberg && !val.icebergMinVisibleSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide a minimum visible size'),
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
      sizeMode,
      side: z.nativeEnum(Side),
      triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      triggerType: z.enum(['price', 'trailingPercentOffset']),
      triggerPrice: z.coerce.number({ message: i18n.t('Required') }),
      price: z.coerce
        .number({ message: i18n.t('Required') })
        .min(Number(priceStep))
        .step(Number(priceStep)),
      sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting).optional(),
      size: z.coerce
        .number()
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      sizePosition: z.coerce.number().min(0.0001).max(100).optional(),
      sizePct: z.number().optional(),
      notional: z.coerce.number().optional(),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      expiresAt: z.date().optional(),
      stopExpiryStrategy,
      stopExpiresAt: z.date().optional(),
      reduceOnly: z.boolean(),
      postOnly: z.boolean(),
      oco: z.boolean(),
      ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection).optional(),
      ocoTriggerType: z.enum(['price', 'trailingPercentOffset']).optional(),
      ocoTriggerPrice: z.coerce.number().optional(),
      ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting).optional(),
      ocoSize: z.coerce
        .number()
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      ocoSizePosition: z.coerce.number().min(0.0001).max(100).optional(),
      ocoNotional: z.coerce.number().optional(),
      ocoSizePct: z.number().optional(),
      ocoPrice: z.coerce
        .number()
        .min(Number(priceStep))
        .step(Number(priceStep))
        .optional(),
      ocoTimeInForce: z.nativeEnum(OrderTimeInForce).optional(),
      ocoExpiresAt: z.date().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.oco && !val.ocoTriggerPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide an OCO trigger'),
          path: ['ocoTriggerPrice'],
        });
      }

      if (val.oco && !val.ocoSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide an OCO size'),
          path: ['ocoSize'],
        });
      }

      if (val.oco && !val.ocoPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide an OCO price'),
          path: ['ocoPrice'],
        });
      }

      if (
        val.sizeOverride ===
        StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      ) {
        if (val.sizePosition === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sizePosition'],
            message: i18n.t('Required'),
          });
        }
      } else {
        if (val.size === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['size'],
            message: i18n.t('Required'),
          });
        }
      }

      if (
        val.oco &&
        val.ocoSize !== undefined &&
        val.ocoSizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      ) {
        if (val.ocoSize <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            type: 'number',
            minimum: 0.0001,
            inclusive: true,
            path: ['ocoSize'],
          });
        }

        if (val.ocoSize > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            type: 'number',
            maximum: 100,
            inclusive: true,
            path: ['ocoSize'],
          });
        }
      } else {
        if (val.ocoSize === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ocoSize'],
            message: i18n.t('Required'),
          });
        }
      }

      if (val.stopExpiryStrategy !== 'none' && !val.stopExpiresAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: i18n.t('Provide a expiry time/date'),
          path: ['stopExpiresAt'],
        });
      }

      if (type !== 'Spot') {
        if (!val.reduceOnly) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t(
              'Stop orders on non spot markets must be reduce only'
            ),
            path: ['reduceOnly'],
          });
        }
      }
    });
};

const stopExpiryStrategy = z.enum([
  'none',
  'cancel',
  'trigger',
  'ocoTriggerAbove',
  'ocoTriggerBelow',
]);

export const createStopMarketSchema = (market: MarketInfo) => {
  const type = getProductType(market);
  const sizeStep = determineSizeStep(market);
  const priceStep = determinePriceStep(market);

  return z
    .object({
      ticketType: z.literal('stopMarket'),
      type: z.literal(OrderType.TYPE_MARKET),
      sizeMode,
      side: z.nativeEnum(Side),
      triggerDirection: z.nativeEnum(StopOrderTriggerDirection),
      triggerType: z.enum(['price', 'trailingPercentOffset']),
      triggerPrice: z.coerce.number({ message: i18n.t('Required') }),
      sizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting).optional(),
      size: z.coerce
        .number({ message: i18n.t('Required') })
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      sizePosition: z.coerce.number().min(0.0001).max(100).optional(),
      sizePct: z.number().optional(),
      notional: z.coerce.number().optional(),
      timeInForce: z.nativeEnum(OrderTimeInForce),
      expiresAt: z.date().optional(),
      stopExpiryStrategy,
      stopExpiresAt: z.date().optional(),
      reduceOnly: z.boolean(),
      oco: z.boolean(),
      ocoTriggerDirection: z.nativeEnum(StopOrderTriggerDirection).optional(),
      ocoTriggerType: z.enum(['price', 'trailingPercentOffset']).optional(),
      ocoTriggerPrice: z.coerce.number().optional(),
      ocoSizeOverride: z.nativeEnum(StopOrderSizeOverrideSetting).optional(),
      ocoSize: z.coerce
        .number()
        .min(Number(sizeStep))
        .step(Number(sizeStep))
        .optional(),
      ocoNotional: z.coerce.number().optional(),
      ocoSizePosition: z.coerce.number().min(0.0001).max(100).optional(),
      ocoSizePct: z.number().optional(),
      ocoPrice: z.coerce
        .number()
        .min(Number(priceStep))
        .step(Number(priceStep))
        .optional(),
      ocoTimeInForce: z.nativeEnum(OrderTimeInForce).optional(),
    })
    .superRefine((val, ctx) => {
      if (val.oco && !val.ocoTriggerPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide an OCO trigger'),
          path: ['ocoTriggerPrice'],
        });
      }

      if (val.oco && !val.ocoSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t('Provide an OCO size'),
          path: ['ocoSize'],
        });
      }

      if (
        val.sizeOverride ===
        StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      ) {
        if (val.sizePosition === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['size'],
            message: i18n.t('Provide a position size'),
          });
        }
      } else {
        if (val.size === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['size'],
            message: i18n.t('Required'),
          });
        }
      }

      if (
        val.oco &&
        val.ocoSize !== undefined &&
        val.ocoSizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      ) {
        if (val.ocoSize <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            type: 'number',
            minimum: 0.0001,
            inclusive: true,
            path: ['ocoSize'],
          });
        }

        if (val.ocoSize > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            type: 'number',
            maximum: 100,
            inclusive: true,
            path: ['ocoSize'],
          });
        }
      } else {
        if (val.ocoSize === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ocoSize'],
            message: i18n.t('Required'),
          });
        }
      }

      if (val.stopExpiryStrategy !== 'none' && !val.stopExpiresAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: i18n.t('Provide a expiry time/date'),
          path: ['stopExpiresAt'],
        });
      }

      if (type !== 'Spot') {
        if (!val.reduceOnly) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t(
              'Stop orders on non spot markets must be reduce only'
            ),
            path: ['reduceOnly'],
          });
        }
      }
    });
};

export const useMarketSchema = (market: MarketInfo) => {
  const schema = useMemo(() => {
    return createMarketSchema(market);
  }, [market]);

  return schema;
};

export const useLimitSchema = (market: MarketInfo) => {
  const schema = useMemo(() => {
    return createLimitSchema(market);
  }, [market]);

  return schema;
};

export const useStopMarketSchema = (market: MarketInfo) => {
  const schema = useMemo(() => {
    return createStopMarketSchema(market);
  }, [market]);

  return schema;
};

export const useStopLimitSchema = (market: MarketInfo) => {
  const schema = useMemo(() => {
    return createStopLimitSchema(market);
  }, [market]);

  return schema;
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
