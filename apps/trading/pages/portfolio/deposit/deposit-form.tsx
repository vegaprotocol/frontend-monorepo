import { DepositPage_assets } from '@vegaprotocol/graphql';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

interface FormFields {
  asset: string;
  from: string;
  to: string;
  amount: string;
}

interface DepositFormProps {
  assets: DepositPage_assets[];
  selectedAsset?: DepositPage_assets;
  onSelectAsset: (assetId: string) => void;
  available: BigNumber;
  submitApprove: () => Promise<void>;
  submitDeposit: (
    contractAddress: string,
    amount: string,
    vegaKey: string
  ) => Promise<void>;
  limits: {
    min: BigNumber;
    max: BigNumber;
  };
}

export const DepositForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
  available,
  submitApprove,
  submitDeposit,
  limits,
}: DepositFormProps) => {
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      asset: selectedAsset?.id || 'not-selected',
      from: account,
      to: keypair?.pub,
    },
  });

  const onDeposit = async (fields: FormFields) => {
    if (selectedAsset.source.__typename !== 'ERC20') {
      return;
    }
    submitDeposit(
      selectedAsset.source.contractAddress,
      removeDecimal(fields.amount, selectedAsset.decimals),
      `0x${keypair.pub}`
    );
  };

  const onApprove = async (fields: FormFields) => {
    submitApprove();
  };

  const assetId = useWatch({ name: 'asset', control });

  useEffect(() => {
    onSelectAsset(assetId);
  }, [assetId, onSelectAsset]);

  const minLimit = limits.min.toString();
  const maxLimit = limits.max.toString();
  const limitsInfo = limits ? `(Min: ${minLimit}, Max: ${maxLimit})` : '';

  return (
    <form onSubmit={handleSubmit(onDeposit)} noValidate={true}>
      <FormGroup label="Asset">
        <Select {...register('asset', { required: 'Required' })}>
          <option value="not-selected" disabled>
            Please select
          </option>
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
      <FormGroup label="From (Ethereum address)">
        <Input {...register('from', { required: 'Required' })} />
        {errors.from?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.from.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label="To (Vega key)">
        <Input {...register('to', { required: 'Required' })} />
        {errors.to?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.to.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label={`Amount ${limitsInfo}`} className="relative">
        <Input
          type="number"
          autoComplete="off"
          {...register('amount', { required: 'Required' })}
        />
        <div className="flex gap-4">
          {errors.amount?.message && (
            <InputError intent="danger" className="mt-4">
              {errors.amount.message}
            </InputError>
          )}
          {account && selectedAsset && (
            <Button
              variant="inline"
              className="ml-auto"
              onClick={() => {
                const amount = BigNumber.minimum(available, limits.max);
                setValue('amount', amount.toFixed(selectedAsset.decimals));
                setError('amount', null);
              }}
            >
              Use maximum
            </Button>
          )}
        </div>
      </FormGroup>
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Deposit
        </Button>
        <Button onClick={handleSubmit(onApprove)} className="flex-1">
          Approve
        </Button>
      </div>
    </form>
  );
};
