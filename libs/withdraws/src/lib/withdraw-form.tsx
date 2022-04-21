import {
  ethereumAddress,
  maxSafe,
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
import type BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { WithdrawalFields } from './use-withdraw';
import type { Asset } from './types';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  assets: Asset[];
  max: BigNumber;
  min: BigNumber;
  selectedAsset?: Asset;
  ethereumAccount?: string;
  onSelectAsset: (assetId: string) => void;
  submitWithdraw: (withdrawal: WithdrawalFields) => void;
}

export const WithdrawForm = ({
  assets,
  max,
  min,
  selectedAsset,
  ethereumAccount,
  onSelectAsset,
  submitWithdraw,
}: WithdrawFormProps) => {
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
      to: ethereumAccount,
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
                clearErrors('asset');
                onSelectAsset(e.target.value);
              }}
              value={selectedAsset?.id}
              id="asset"
            >
              <option value="">{t('Please select')}</option>
              {assets.map((a) => (
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
        <Input
          {...register('to', { validate: { required, ethereumAddress } })}
          id="ethereum-address"
        />
        {errors.to?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.to.message}
          </InputError>
        )}
        {ethereumAccount && (
          <UseButton
            onClick={() => {
              setValue('to', ethereumAccount);
              clearErrors('to');
            }}
          >
            {t('Use connected')}
          </UseButton>
        )}
      </FormGroup>

      <FormGroup label={t('Amount')} labelFor="amount" className="relative">
        <Input
          type="number"
          autoComplete="off"
          id="amount"
          {...register('amount', {
            validate: {
              required,
              maxSafe: (value) => maxSafe(max)(value),
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
            onClick={() => {
              setValue('amount', max.toFixed(selectedAsset.decimals));
              clearErrors('amount');
            }}
          >
            {t('Use maximum')}
          </UseButton>
        )}
      </FormGroup>
      <Button type="submit">Submit</Button>
    </form>
  );
};

interface UseButtonProps {
  children: ReactNode;
  onClick: () => void;
}

const UseButton = ({ children, onClick }: UseButtonProps) => {
  return (
    <button
      type="button"
      className="ml-auto text-ui absolute top-0 right-0 underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
