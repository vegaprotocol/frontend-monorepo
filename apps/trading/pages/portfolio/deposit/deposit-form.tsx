import { Deposit_assets } from '@vegaprotocol/graphql';
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
import { useForm } from 'react-hook-form';

interface FormFields {
  from: string;
  to: string;
  amount: string;
}

interface DepositFormProps {
  assets: Deposit_assets[];
  selectedAsset?: Deposit_assets;
  onSelectAsset: (assetId: string) => void;
  available: BigNumber;
}

export const DepositForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
  available,
}: DepositFormProps) => {
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>();

  const onSubmit = async (fields: FormFields) => {
    console.log(fields);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup label="Asset">
        <Select
          value={selectedAsset?.id || ''}
          onChange={(e) => onSelectAsset(e.target.value)}
        >
          <option value="" disabled>
            Please select
          </option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup label="From (Ethereum address)">
        <Input {...register('from', { required: 'Required' })} />
        <FormGroupSub>
          {errors.from?.message && (
            <InputError intent="danger" className="mt-4">
              {errors.from.message}
            </InputError>
          )}
          {account && (
            <Button
              variant="inline"
              className="ml-auto"
              onClick={() => setValue('from', account)}
            >
              Use connected
            </Button>
          )}
        </FormGroupSub>
      </FormGroup>
      <FormGroup label="To (Vega key)">
        <Input {...register('to', { required: 'Required' })} />
        <FormGroupSub>
          {errors.to?.message && (
            <InputError intent="danger" className="mt-4">
              {errors.to.message}
            </InputError>
          )}
          {keypair?.pub && (
            <Button
              variant="inline"
              className="ml-auto"
              onClick={() => setValue('to', keypair.pub)}
            >
              Use connected
            </Button>
          )}
        </FormGroupSub>
      </FormGroup>
      <FormGroup label="Amount">
        <Input
          type="number"
          {...register('amount', { required: 'Required' })}
        />
        <FormGroupSub>
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
                console.log(available && available.toNumber());
                setValue(
                  'amount',
                  available ? available.toFixed(selectedAsset.decimals) : '0'
                );
              }}
            >
              Use maximum
            </Button>
          )}
        </FormGroupSub>
      </FormGroup>
      <Button type="submit">Deposit</Button>
    </form>
  );
};

const FormGroupSub = ({ children }) => {
  return <div className="flex justify-between">{children}</div>;
};
