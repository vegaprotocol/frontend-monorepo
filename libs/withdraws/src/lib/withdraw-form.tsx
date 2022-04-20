import { removeDecimal, t } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import type BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { WithdrawalFields } from './use-withdraw';
import type { Asset } from './types';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  ethereumAccount: string | undefined;
  assets: Asset[];
  selectedAsset?: Asset;
  max: BigNumber;
  onSelectAsset: (assetId: string) => void;
  submitWithdrawalCreate: (withdrawal: WithdrawalFields) => void;
}

export const WithdrawForm = ({
  ethereumAccount,
  assets,
  selectedAsset,
  max,
  onSelectAsset,
  submitWithdrawalCreate,
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
  const onCreateWithdraw = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }

    submitWithdrawalCreate({
      asset: selectedAsset.id,
      amount: removeDecimal(fields.amount, selectedAsset.decimals),
      receiverAddress: fields.to,
    });
  };

  const assetId = useWatch({ name: 'asset', control });

  useEffect(() => {
    onSelectAsset(assetId);
  }, [assetId, onSelectAsset]);

  return (
    <form onSubmit={handleSubmit(onCreateWithdraw)} noValidate={true}>
      <FormGroup label={t('Asset')} labelFor="asset" className="relative">
        <Select {...register('asset', { required: t('Required') })} id="asset">
          <option value="">{t('Please select')}</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
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
          {...register('to', {
            required: t('Required'),
            validate: {
              validEthereumAddress: (value) => {
                if (!ethers.utils.isAddress(value)) {
                  return t('Invalid Ethereum address');
                }

                return true;
              },
            },
          })}
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
            required: t('Required'),
          })}
        />
        {errors.amount?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.amount.message}
          </InputError>
        )}
        {ethereumAccount && selectedAsset && (
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
