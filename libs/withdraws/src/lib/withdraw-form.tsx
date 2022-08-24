import type { Asset } from '@vegaprotocol/react-helpers';
import {
  ethereumAddress,
  minSafe,
  t,
  removeDecimal,
  required,
  isAssetTypeERC20,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawLimits } from './withdraw-limits';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  assets: Asset[];
  min: BigNumber;
  balance: BigNumber;
  selectedAsset?: Asset;
  threshold: BigNumber;
  onSelectAsset: (assetId: string) => void;
  submitWithdraw: (withdrawal: WithdrawalArgs) => void;
}

export const WithdrawForm = ({
  assets,
  balance,
  min,
  selectedAsset,
  threshold,
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
  const onSubmit = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }
    submitWithdraw({
      asset: selectedAsset.id,
      amount: removeDecimal(fields.amount, selectedAsset.decimals),
      receiverAddress: fields.to,
    });
  };

  return (
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
            >
              <option value="">{t('Please select')}</option>
              {assets.filter(isAssetTypeERC20).map((a) => (
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
      <FormGroup label={t('To (Ethereum address)')} labelFor="ethereum-address">
        <Input
          id="ethereum-address"
          {...register('to', { validate: { required, ethereumAddress } })}
        />
        {errors.to?.message && (
          <InputError intent="danger">{errors.to.message}</InputError>
        )}
      </FormGroup>
      {selectedAsset && threshold && (
        <div className="mb-6">
          <WithdrawLimits threshold={threshold} balance={balance} />
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
          <InputError intent="danger" className="mt-4">
            {errors.amount.message}
          </InputError>
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
      <Button variant="primary" data-testid="submit-withdrawal" type="submit">
        Submit
      </Button>
    </form>
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
