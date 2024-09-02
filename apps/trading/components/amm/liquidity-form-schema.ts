import { z } from 'zod';
import { t } from '../../lib/use-t';

const amount = z
  .number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_AMOUNT_ERROR_TYPE'),
  })
  .gt(0, t('AMM_LIQUIDITY_FORM_AMOUNT_ERROR_MIN', { min: 0 }));
const fee = z
  .number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_FEE_ERROR_TYPE'),
  })
  .gt(0, t('AMM_LIQUIDITY_FORM_FEE_ERROR_MIN', { min: 0 }))
  .lt(1, t('AMM_LIQUIDITY_FORM_FEE_ERROR_MAX', { max: 1 })); // TODO: net param "market.liquidity.maximumLiquidityFeeFactorLevel"
const slippageTolerance = z
  .number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_TYPE'),
  })
  .gt(0, t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_MIN', { min: 0 }))
  .lt(1, t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_MAX', { max: 1 }));
const upperBound = z.optional(
  z.number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_UPPER_BOUND_ERROR_TYPE'),
  })
);
const lowerBound = z.optional(
  z.number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_LOWER_BOUND_ERROR_TYPE'),
  })
);
const base = z.number({
  coerce: true,
  invalid_type_error: t('AMM_LIQUIDITY_FORM_BASE_ERROR_TYPE'),
});
const leverageAtUpperBound = z.optional(
  z.number({
    coerce: true,
    invalid_type_error: t(
      'AMM_LIQUIDITY_FORM_LEVERAGE_AT_UPPER_BOUND_ERROR_TYPE'
    ),
  })
);
const leverageAtLowerBound = z.optional(
  z.number({
    coerce: true,
    invalid_type_error: t(
      'AMM_LIQUIDITY_FORM_LEVERAGE_AT_LOWER_BOUND_ERROR_TYPE'
    ),
  })
);

export const createSubmitSchema = () => {
  return z
    .object({
      marketId: z.string(),
      amount,
      fee,
      slippageTolerance,
      upperBound,
      lowerBound,
      base,
      leverageAtUpperBound,
      leverageAtLowerBound,
    })
    .superRefine((val, ctx) => {
      if (!val.lowerBound && !val.upperBound) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['upperBound'],
          message: t('AMM_LIQUIDITY_FORM_BOUNDS_REQUIRED'),
        });
      }
    });
};

export const createAmendSchema = () => {
  return z.object({
    marketId: z.string(),
    amount: amount.optional(),
    fee: fee.optional(),
    slippageTolerance,
    upperBound: upperBound.optional(),
    lowerBound: lowerBound.optional(),
    base: base.optional(),
    leverageAtUpperBound: leverageAtUpperBound.optional(),
    leverageAtLowerBound: leverageAtLowerBound.optional(),
  });
};

export type SubmitAMMFormFields = z.infer<
  ReturnType<typeof createSubmitSchema>
>;
export type AmendAMMFormFields = z.infer<ReturnType<typeof createAmendSchema>>;
