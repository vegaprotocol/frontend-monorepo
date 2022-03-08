import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RestConnector } from '.';

interface FormFields {
  wallet: string;
  passphrase: string;
}

interface RestConnectorFormProps {
  connector: RestConnector;
  onAuthenticate: () => void;
}

export function RestConnectorForm({
  connector,
  onAuthenticate,
}: RestConnectorFormProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  async function onSubmit(fields: FormFields) {
    try {
      setError('');
      const res = await connector.authenticate({
        wallet: fields.wallet,
        passphrase: fields.passphrase,
      });

      if (res.success) {
        onAuthenticate();
      } else {
        throw res.error;
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Wallet not running at http://localhost:1789');
      } else if (err instanceof Error) {
        setError('Authentication failed');
      } else {
        setError('Something went wrong');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup label="Wallet" labelFor="wallet">
        <Input
          {...register('wallet', { required: 'Required' })}
          id="wallet"
          type="text"
          autoFocus={true}
        />
        {errors.wallet?.message && (
          <InputError intent="danger">{errors.wallet.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="Passphrase" labelFor="passphrase">
        <Input
          {...register('passphrase', { required: 'Required' })}
          id="passphrase"
          type="password"
        />
        {errors.passphrase?.message && (
          <InputError intent="danger">{errors.passphrase.message}</InputError>
        )}
      </FormGroup>
      {error && (
        <InputError intent="danger" className="mb-12">
          {error}
        </InputError>
      )}
      <Button variant="primary" type="submit">
        Connect
      </Button>
    </form>
  );
}
