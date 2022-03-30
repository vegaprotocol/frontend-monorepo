import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { RestConnector } from '.';

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
    <form onSubmit={handleSubmit(onSubmit)} data-testid="rest-connector-form">
      <FormGroup label="Wallet" labelFor="wallet">
        <Input
          {...register('wallet', { required: 'Required' })}
          id="wallet"
          type="text"
          autoFocus={true}
        />
        {errors.wallet?.message && (
          <InputError
            data-testid="input-wallet-error"
            intent="danger"
            className="mt-4"
          >
            {errors.wallet.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label="Passphrase" labelFor="passphrase">
        <Input
          {...register('passphrase', { required: 'Required' })}
          id="passphrase"
          type="password"
        />
        {errors.passphrase?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.passphrase.message}
          </InputError>
        )}
      </FormGroup>
      {error && (
        <p className="text-intent-danger mb-12" data-testid="form-error">
          {error}
        </p>
      )}
      <Button variant="primary" type="submit">
        Connect
      </Button>
    </form>
  );
}
