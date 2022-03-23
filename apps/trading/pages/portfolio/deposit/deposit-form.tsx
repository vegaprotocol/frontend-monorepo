import { Button, FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import { useForm } from 'react-hook-form';

interface FormFields {
  from: string;
  to: string;
  amount: number;
}

export const DepositForm = () => {
  const { accounts } = useWeb3React();
  const { keypair } = useVegaWallet();
  const { register, handleSubmit, setValue } = useForm<FormFields>();

  const onSubmit = async (fields: FormFields) => {
    console.log(fields);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup label="From (Ethereum address)">
        <Input {...register('from', { required: 'Required' })} />
        <div onClick={() => setValue('from', accounts[0])}>Use connected</div>
      </FormGroup>
      <FormGroup label="To (Vega key)">
        <Input {...register('to', { required: 'Required' })} />
        <div onClick={() => setValue('to', keypair.pub)}>Use connected</div>
      </FormGroup>
      <FormGroup label="Amount">
        <Input {...register('amount', { required: 'Required' })} />
        {/* TODO: Get real maximum value */}
        <div onClick={() => setValue('amount', 100)}>Use maximum</div>
      </FormGroup>
      <Button type="submit">Deposit</Button>
    </form>
  );
};
