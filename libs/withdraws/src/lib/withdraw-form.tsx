import {
  isAssetTypeERC20,
  ethereumAddress,
  minSafe,
  t,
  removeDecimal,
  required,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { WithdrawalAssetFieldsFragment } from './__generated__/Withdrawal';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawLimits } from './withdraw-limits';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  assets: WithdrawalAssetFieldsFragment[];
  min: BigNumber;
  balance: BigNumber;
  selectedAsset?: WithdrawalAssetFieldsFragment;
  threshold: BigNumber;
  delay: number | undefined;
  onSelectAsset: (assetId: string) => void;
  submitWithdraw: (withdrawal: WithdrawalArgs) => void;
}

export const WithdrawForm = ({
  assets,
  balance,
  min,
  selectedAsset,
  threshold,
  delay,
  onSelectAsset,
  submitWithdraw,
}: WithdrawFormProps) => {
  const { account: address } = useWeb3React();
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      asset: selectedAsset?.id,
      to: address,
    },
  });

  const amount = useWatch({ name: 'amount', control });

  const onSubmit = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }
    submitWithdraw({
      asset: selectedAsset.id,
      amount: removeDecimal(fields.amount, selectedAsset.decimals),
      receiverAddress: fields.to,
      availableTimestamp:
        new BigNumber(fields.amount).isGreaterThan(threshold) && delay
          ? Date.now() + delay * 1000
          : null,
    });
  };

  return (
    <>
      <div className="mb-4 text-sm">
        <p>{t('There are two steps required to make a withdrawal')}</p>
        <ol className="list-disc pl-4">
          <li>{t('Step 1 - Release funds from Vega')}</li>
          <li>{t('Step 2 - Transfer funds to your Ethereum wallet')}</li>
        </ol>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate={true}
        data-testid="withdraw-form"
      >
        <FormGroup label={t('Asset')} labelFor="asset">
          <Controller
            control={control}
            name="asset"
            rules={{ validate: { required } }}
            render={({ field }) => (
              <Select
                {...field}
                onChange={(e) => {
                  onSelectAsset(e.target.value);
                  field.onChange(e.target.value);
                }}
                value={selectedAsset?.id || ''}
                id="asset"
                name="asset"
              >
                <option value="">{t('Please select')}</option>
                {assets.filter(asset => isAssetTypeERC20(asset.source)).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.asset?.message && (
            <InputError intent="danger">{errors.asset.message}</InputError>
          )}
        </FormGroup>
        <FormGroup
          label={t('To (Ethereum address)')}
          labelFor="ethereum-address"
        >
          <Input
            id="ethereum-address"
            {...register('to', { validate: { required, ethereumAddress } })}
          />
          {errors.to?.message && (
            <InputError intent="danger">{errors.to.message}</InputError>
          )}
        </FormGroup>
        {selectedAsset && threshold && (
          <div className="mb-4">
            <WithdrawLimits
              amount={amount}
              threshold={threshold}
              delay={delay}
              balance={balance}
            />
          </div>
        )}
        <FormGroup label={t('Amount')} labelFor="amount">
          <Input
            type="number"
            autoComplete="off"
            id="amount"
            {...register('amount', {
              validate: {
                required,
                maxSafe: (v) => {
                  const value = new BigNumber(v);
                  if (value.isGreaterThan(balance)) {
                    return t('Insufficient amount in account');
                  }
                  return true;
                },
                minSafe: (value) => minSafe(min)(value),
              },
            })}
          />
          {errors.amount?.message && (
            <InputError intent="danger">{errors.amount.message}</InputError>
          )}
          {selectedAsset && (
            <UseButton
              data-testid="use-maximum"
              onClick={() => {
                setValue('amount', balance.toFixed(selectedAsset.decimals));
                clearErrors('amount');
              }}
            >
              {t('Use maximum')}
            </UseButton>
          )}
        </FormGroup>
        <Button data-testid="submit-withdrawal" type="submit" variant="primary">
          Release funds
        </Button>
      </form>
    </>
  );
};

interface UseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const UseButton = ({ children, ...rest }: UseButtonProps) => {
  return (
    <button
      {...rest}
      type="button"
      className="ml-auto text-sm absolute top-0 right-0 underline"
    >
      {children}
    </button>
  );
};
