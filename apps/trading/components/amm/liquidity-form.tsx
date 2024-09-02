import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
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
import { useT } from '../../lib/use-t';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';

import {
  type SubmitAMMFormFields,
  type AmendAMMFormFields,
  createSubmitSchema,
  createAmendSchema,
} from './liquidity-form-schema';

type LiquidityFormProps = {
  market: Market;
  pubKey: string;
  type?: 'submit' | 'amend';
  defaultValues?: Partial<SubmitAMMFormFields>;
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

  const schema = useMemo(() => {
    return type === 'submit' ? createSubmitSchema() : createAmendSchema();
  }, [type]);

  const form = useForm<SubmitAMMFormFields | AmendAMMFormFields>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { errors } = useFormState(form);

  const onSubmit = (values: SubmitAMMFormFields | AmendAMMFormFields) => {
    if (!pubKey || !market) {
      form.setError('root', { message: t('AMM_LIQUIDITY_FORM_ROOT_ERROR') });
      return;
    }

    let tx = undefined;
    switch (type) {
      case 'submit':
        tx = createSubmitAmmTransaction(
          values as SubmitAMMFormFields,
          market.quoteAsset
        );
        break;
      case 'amend':
        tx = createAmendAmmTransaction(
          values as AmendAMMFormFields,
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
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <fieldset className="flex flex-col gap-1">
          <legend className="text-xl">
            {t('AMM_LIQUIDITY_FORM_SECTION_COMMITMENT')}
          </legend>
          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormLabel>
                      {t('AMM_LIQUIDITY_FORM_AMOUNT_LABEL')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={t(
                            'AMM_LIQUIDITY_FORM_AMOUNT_PLACEHOLDER'
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
        </fieldset>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-xl">
            {t('AMM_LIQUIDITY_FORM_SECTION_PRICING')}
          </legend>
          <div className="flex flex-col gap-4">
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
          </div>
        </fieldset>
        <Button intent={Intent.Primary} className="self-start" type="submit">
          {t('AMM_LIQUIDITY_FORM_SUBMIT')}
        </Button>
        {errors.root?.message && (
          <FormMessage>{errors.root.message}</FormMessage>
        )}
      </form>
    </Form>
  );
};
