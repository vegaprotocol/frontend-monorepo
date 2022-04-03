import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ethers } from 'ethers';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: {
    contractAddress: string;
  };
}

interface FormFields {
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface CreateWithdrawFormProps {
  assets: Asset[];
  selectedAsset?: Asset;
  onSelectAsset: (assetId: string) => void;
}

export const CreateWithdrawForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
}: CreateWithdrawFormProps) => {
  const { keypair } = useVegaWallet();
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
      from: keypair?.pub,
    },
  });

  const onCreateWithdraw = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }
    console.log(fields);
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
        label={t('From (Vega key)')}
        labelFor="vega-key"
        className="relative"
      >
        <Input
          {...register('from', {
            required: t('Required'),
            validate: {
              validVegaAddress: (value) => {
                if (value.length !== 64 || !/^[A-Za-z0-9]*$/i.test(value)) {
                  return t('Invalid Vega key');
                }

                return true;
              },
            },
          })}
          id="vega-key"
        />
        {errors.from?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.from.message}
          </InputError>
        )}
        {keypair?.pub && (
          <UseButton
            onClick={() => {
              setValue('from', keypair.pub);
              clearErrors('from');
            }}
          >
            {t('Use connected')}
          </UseButton>
        )}
      </FormGroup>
      <FormGroup label={t('To (Ethereum address)')} labelFor="ethereum-address">
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
