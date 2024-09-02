import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { AssetPill } from './asset-pill';
import type { Market } from '@vegaprotocol/rest';
import { useSimpleTransaction } from '@vegaprotocol/wallet-react';
import {
  createAmendAmmTransaction,
  createSubmitAmmTransaction,
} from '../../lib/utils/amm';
import { TransactionDialog } from '../transaction-dialog/transaction-dialog';
import { t, useT } from '../../lib/use-t';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';

const submitAMMFormSchema = z.object({
  marketId: z.string(),
  amount: z
    .number({
      coerce: true,
      invalid_type_error: t('AMM_LIQUIDITY_FORM_AMOUNT_ERROR_TYPE'),
    })
    .gt(0, t('AMM_LIQUIDITY_FORM_AMOUNT_ERROR_MIN', { min: 0 })),
  fee: z
    .number({
      coerce: true,
      invalid_type_error: t('AMM_LIQUIDITY_FORM_FEE_ERROR_TYPE'),
    })
    .gt(0, t('AMM_LIQUIDITY_FORM_FEE_ERROR_MIN', { min: 0 }))
    .lt(1, t('AMM_LIQUIDITY_FORM_FEE_ERROR_MAX', { max: 1 })), // TODO: net param "market.liquidity.maximumLiquidityFeeFactorLevel"
  slippageTolerance: z
    .number({
      coerce: true,
      invalid_type_error: t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_TYPE'),
    })
    .gt(0, t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_MIN', { min: 0 }))
    .lt(1, t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_ERROR_MAX', { max: 1 })),

  // ConcentratedLiquidityParameters
  upperBound: z.optional(
    z.number({
      coerce: true,
      invalid_type_error: t('AMM_LIQUIDITY_FORM_UPPER_BOUND_ERROR_TYPE'),
    })
  ),
  lowerBound: z.optional(
    z.number({
      coerce: true,
      invalid_type_error: t('AMM_LIQUIDITY_FORM_LOWER_BOUND_ERROR_TYPE'),
    })
  ),
  base: z.number({
    coerce: true,
    invalid_type_error: t('AMM_LIQUIDITY_FORM_BASE_ERROR_TYPE'),
  }),
  leverageAtUpperBound: z.optional(
    z.number({
      coerce: true,
      invalid_type_error: t(
        'AMM_LIQUIDITY_FORM_LEVERAGE_AT_UPPER_BOUND_ERROR_TYPE'
      ),
    })
  ),
  leverageAtLowerBound: z.optional(
    z.number({
      coerce: true,
      invalid_type_error: t(
        'AMM_LIQUIDITY_FORM_LEVERAGE_AT_LOWER_BOUND_ERROR_TYPE'
      ),
    })
  ),
});

const amendAMMFormSchema = submitAMMFormSchema.partial({
  // marketId IS NOT OPTIONAL
  amount: true,
  fee: true,
  // slippageTolerance IS NOT OPTIONAL
  upperBound: true,
  lowerBound: true,
  base: true,
  leverageAtUpperBound: true,
  leverageAtLowerBound: true,
});

type SubmitAMMFormSchema = typeof submitAMMFormSchema;
type AmendAMMFormSchema = typeof amendAMMFormSchema;
type SubmitAMMFormFields = z.infer<SubmitAMMFormSchema>;
type AmendAMMFormFields = z.infer<AmendAMMFormSchema>;

export type SubmitAMMData = z.infer<SubmitAMMFormSchema>;
export type AmendAMMData = z.infer<AmendAMMFormSchema>;

type LiquidityFormProps = {
  market: Market;
  pubKey: string;
  type?: 'submit' | 'amend';
  defaultValues?: Partial<SubmitAMMData>;
};

export const LiquidityForm = ({
  market,
  pubKey,
  type = 'submit',
  defaultValues,
}: LiquidityFormProps) => {
  const t = useT();
  const { error, send, result, status, reset } = useSimpleTransaction();
  const [open, setOpen] = useState(false);
  const form = useForm<SubmitAMMFormFields | AmendAMMFormFields>({
    resolver: zodResolver(
      type === 'amend' ? amendAMMFormSchema : submitAMMFormSchema
    ),
    defaultValues,
  });
  const { errors } = useFormState(form);

  const onSubmit = (values: SubmitAMMData | AmendAMMData) => {
    if (!pubKey || !market) {
      form.setError('root', { message: t('AMM_LIQUIDITY_FORM_ROOT_ERROR') });
      return;
    }

    let tx = undefined;
    switch (type) {
      case 'submit':
        tx = createSubmitAmmTransaction(
          values as SubmitAMMData,
          market.quoteAsset
        );
        break;
      case 'amend':
        tx = createAmendAmmTransaction(
          values as AmendAMMData,
          market.quoteAsset
        );
    }

    send(tx);
    setOpen(true);
  };

  return (
    <Form {...form}>
      <TransactionDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          reset();
        }}
        title={t('AMM_LIQUIDITY_TITLE')}
        txStatus={status}
        error={error}
        result={result}
        reset={reset}
      />
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h2 className="text-xl">
          {t('AMM_LIQUIDITY_FORM_SECTION_COMMITMENT')}
        </h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>{t('AMM_LIQUIDITY_FORM_AMOUNT_LABEL')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t('AMM_LIQUIDITY_FORM_AMOUNT_PLACEHOLDER')}
                        type="number"
                        {...field}
                        value={field.value || ''}
                      />
                      <AssetPill
                        asset={market.quoteAsset}
                        className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>{t('AMM_LIQUIDITY_FORM_FEE_LABEL')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('AMM_LIQUIDITY_FORM_FEE_PLACEHOLDER')}
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="slippageTolerance"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>
                    {t('AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_LABEL')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'AMM_LIQUIDITY_FORM_SLIPPAGE_TOLERANCE_PLACEHOLDER'
                      )}
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <h2 className="text-xl">{t('AMM_LIQUIDITY_FORM_SECTION_PRICING')}</h2>
        <FormField
          control={form.control}
          name="base"
          render={({ field }) => {
            return (
              <FormItem className="flex-1">
                <FormLabel>{t('AMM_LIQUIDITY_FORM_BASE_LABEL')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('AMM_LIQUIDITY_FORM_BASE_PLACEHOLDER')}
                      type="number"
                      {...field}
                      value={field.value || ''}
                    />
                    <AssetPill
                      asset={market.quoteAsset}
                      className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="upperBound"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>
                    {t('AMM_LIQUIDITY_FORM_UPPER_BOUND_LABEL')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(
                          'AMM_LIQUIDITY_FORM_UPPER_BOUND_PLACEHOLDER'
                        )}
                        type="number"
                        {...field}
                        value={field.value || ''}
                      />
                      <AssetPill
                        asset={market.quoteAsset}
                        className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="leverageAtUpperBound"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>
                    {t('AMM_LIQUIDITY_FORM_LEVERAGE_AT_UPPER_BOUND_LABEL')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(
                          'AMM_LIQUIDITY_FORM_LEVERAGE_AT_UPPER_BOUND_PLACEHOLDER'
                        )}
                        type="number"
                        {...field}
                        value={field.value || ''}
                      />
                      <AssetPill
                        asset={market.quoteAsset}
                        className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="lowerBound"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>
                    {t('AMM_LIQUIDITY_FORM_LOWER_BOUND_LABEL')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(
                          'AMM_LIQUIDITY_FORM_LOWER_BOUND_PLACEHOLDER'
                        )}
                        type="number"
                        {...field}
                        value={field.value || ''}
                      />
                      <AssetPill
                        asset={market.quoteAsset}
                        className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="leverageAtLowerBound"
            render={({ field }) => {
              return (
                <FormItem className="flex-1">
                  <FormLabel>
                    {t('AMM_LIQUIDITY_FORM_LEVERAGE_AT_LOWER_BOUND_LABEL')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(
                          'AMM_LIQUIDITY_FORM_LEVERAGE_AT_LOWER_BOUND_PLACEHOLDER'
                        )}
                        type="number"
                        {...field}
                        value={field.value || ''}
                      />
                      <AssetPill
                        asset={market.quoteAsset}
                        className="-translate-y-1/2 absolute top-1/2 right-2 transform"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="relative h-[20vw] w-full bg-surface-1">
          <BarChart3Icon
            size={48}
            className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform"
          />
        </div>
        <Button intent={Intent.Primary} className="w-full" type="submit">
          {t('AMM_LIQUIDITY_FORM_SUBMIT')}
        </Button>
        {errors.root?.message && (
          <FormMessage>{errors.root.message}</FormMessage>
        )}
      </form>
    </Form>
  );
};
