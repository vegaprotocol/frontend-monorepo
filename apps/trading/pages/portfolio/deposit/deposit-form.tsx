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
import { ReactNode, useEffect } from 'react';
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
  allowance: BigNumber | null;
}

export const DepositForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
  available,
  submitApprove,
  submitDeposit,
  limits,
  allowance,
}: DepositFormProps) => {
  const { account } = useWeb3React();
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
      from: account,
      to: keypair?.pub,
      amount: '0',
    },
  });

  const onDeposit = async (fields: FormFields) => {
    if (selectedAsset?.source.__typename !== 'ERC20' || !keypair) {
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
  const amount = useWatch({ name: 'amount', control });

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
          <option value="">Please select</option>
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
      <FormGroup label="To (Vega key)" className="relative">
        <Input {...register('to', { required: 'Required' })} />
        {errors.to?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.to.message}
          </InputError>
        )}
        {keypair?.pub && (
          <UseButton
            onClick={() => {
              setValue('to', keypair.pub);
            }}
          >
            Use connected
          </UseButton>
        )}
      </FormGroup>
      <FormGroup label={`Amount ${limitsInfo}`} className="relative">
        <Input
          type="number"
          autoComplete="off"
          {...register('amount', { required: 'Required' })}
        />
        {errors.amount?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.amount.message}
          </InputError>
        )}
        {account && selectedAsset && (
          <UseButton
            onClick={() => {
              const amount = BigNumber.minimum(available, limits.max);
              setValue('amount', amount.toFixed(selectedAsset.decimals));
              clearErrors('amount');
            }}
          >
            Use maximum
          </UseButton>
        )}
      </FormGroup>
      <FormButton
        selectedAsset={selectedAsset}
        amount={new BigNumber(amount || 0)}
        allowance={allowance}
        onApproveClick={handleSubmit(onApprove)}
      />
    </form>
  );
};

interface FormButtonProps {
  selectedAsset?: DepositPage_assets;
  amount: BigNumber;
  allowance: BigNumber | null;
  onApproveClick: () => void;
}

const FormButton = ({
  selectedAsset,
  amount,
  allowance,
  onApproveClick,
}: FormButtonProps) => {
  const approved =
    allowance && allowance.isGreaterThan(0) && amount.isLessThan(allowance);
  let button = null;
  let message = '';

  if (!selectedAsset) {
    button = (
      <Button type="submit" className="w-full">
        Deposit
      </Button>
    );
  } else if (approved) {
    message = `Deposits of ${selectedAsset.symbol} have been approved`;
    button = (
      <Button type="submit" className="w-full">
        Deposit
      </Button>
    );
  } else {
    message = `Deposits of ${selectedAsset.symbol} not approved`;
    button = (
      <Button onClick={onApproveClick} className="w-full">
        Approve {selectedAsset.symbol}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <p className="text-ui text-center mb-4">{message}</p>}
      {button}
    </div>
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
