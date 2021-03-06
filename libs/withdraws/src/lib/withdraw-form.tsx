import type { Asset } from '@vegaprotocol/react-helpers';
import {
  ethereumAddress,
  minSafe,
  t,
  removeDecimal,
  required,
  maxSafe,
  isAssetTypeERC20,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { Web3WalletInput } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { WithdrawalFields } from './use-withdraw';
import { WithdrawLimits } from './withdraw-limits';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  assets: Asset[];
  max: {
    balance: BigNumber;
    threshold: BigNumber;
  };
  min: BigNumber;
  selectedAsset?: Asset;
  limits: {
    max: BigNumber;
  } | null;
  onSelectAsset: (assetId: string) => void;
  submitWithdraw: (withdrawal: WithdrawalFields) => void;
}

export const WithdrawForm = ({
  assets,
  max,
  min,
  selectedAsset,
  limits,
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
      <FormGroup label={t('Asset')} labelFor="asset" className="relative">
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
          <InputError intent="danger" className="mt-4">
            {errors.asset.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup
        label={t('To (Ethereum address)')}
        labelFor="ethereum-address"
        className="relative"
      >
        <Web3WalletInput
          inputProps={{
            id: 'ethereum-address',
            ...register('to', { validate: { required, ethereumAddress } }),
          }}
        />
        {errors.to?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.to.message}
          </InputError>
        )}
      </FormGroup>
      {selectedAsset && limits && (
        <div className="mb-20">
          <WithdrawLimits limits={limits} balance={max.balance} />
        </div>
      )}
      <FormGroup label={t('Amount')} labelFor="amount" className="relative">
        <Input
          type="number"
          autoComplete="off"
          id="amount"
          {...register('amount', {
            validate: {
              required,
              maxSafe: (v) => {
                const value = new BigNumber(v);
                if (value.isGreaterThan(max.balance)) {
                  return t('Insufficient amount in account');
                } else if (value.isGreaterThan(max.threshold)) {
                  return t('Amount is above temporary withdrawal limit');
                }
                return maxSafe(BigNumber.minimum(max.balance, max.threshold))(
                  v
                );
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
              setValue('amount', max.balance.toFixed(selectedAsset.decimals));
              clearErrors('amount');
            }}
          >
            {t('Use maximum')}
          </UseButton>
        )}
      </FormGroup>
      <Button data-testid="submit-withdrawal" type="submit">
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
      className="ml-auto text-ui absolute top-0 right-0 underline"
    >
      {children}
    </button>
  );
};
