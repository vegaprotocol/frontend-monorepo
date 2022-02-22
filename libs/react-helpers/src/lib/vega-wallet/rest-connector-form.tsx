import { useForm } from 'react-hook-form';
import { RestConnector } from '.';

interface FormFields {
  wallet: string;
  passphrase: string;
}

interface RestConnectorFormProps {
  connector: RestConnector;
  setDialogOpen: (isOpen: boolean) => void;
  onAuthenticate: () => void;
}

export function RestConnectorForm({
  connector,
  setDialogOpen,
  onAuthenticate,
}: RestConnectorFormProps) {
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
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vega-wallet-form">
      <div style={{ marginBottom: 10 }}>
        <input
          {...register('wallet', { required: 'Required' })}
          type="text"
          placeholder="Wallet"
        />
        {errors.wallet?.message && <div>{errors.wallet.message}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          {...register('passphrase', { required: 'Required' })}
          type="text"
          placeholder="Passphrase"
        />
        {errors.passphrase?.message && <div>{errors.passphrase.message}</div>}
      </div>
      <button type="submit">Connect</button>
    </form>
  );
}
