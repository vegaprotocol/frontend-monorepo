import { Button, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
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
  const [error, setError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  async function onSubmit(fields: FormFields) {
    try {
      const success = await connector.authenticate({
        wallet: fields.wallet,
        passphrase: fields.passphrase,
      });

      if (success) {
        onAuthenticate();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'string') {
        setError(new Error(err));
      } else {
        setError(new Error('Something went wrong'));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-12">
        <Input
          className="w-full px-12 py-4 border-black border"
          {...register('wallet', { required: 'Required' })}
          type="text"
          placeholder="Wallet"
        />
        {errors.wallet?.message && (
          <InputError
            intent="danger"
            className="mt-4 text-sm text-intent-danger"
          >
            {errors.wallet.message}
          </InputError>
        )}
      </div>
      <div className="mb-12">
        <Input
          className="w-full px-12 py-4 border-black border"
          {...register('passphrase', { required: 'Required' })}
          type="password"
          placeholder="Passphrase"
        />
        {errors.passphrase?.message && (
          <InputError
            intent="danger"
            className="mt-4 text-sm text-intent-danger"
          >
            {errors.passphrase.message}
          </InputError>
        )}
      </div>
      {error && <div className="mb-12 text-intent-danger">{error.message}</div>}
      <Button variant="primary" type="submit">
        Connect
      </Button>
    </form>
  );
}
