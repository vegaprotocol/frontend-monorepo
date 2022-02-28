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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    // TODO: Remove default values
    defaultValues: {
      wallet: 'matt',
      passphrase: '123',
    },
  });

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: 10 }}>
        <input
          className="w-full px-8 py-2 border-black border"
          {...register('wallet', { required: 'Required' })}
          type="text"
          placeholder="Wallet"
        />
        {errors.wallet?.message && <div>{errors.wallet.message}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          className="w-full px-8 py-2 border-black border"
          {...register('passphrase', { required: 'Required' })}
          type="text"
          placeholder="Passphrase"
        />
        {errors.passphrase?.message && <div>{errors.passphrase.message}</div>}
      </div>
      <button type="submit" className="rounded-sm bg-pink text-white py-4 px-8">
        Connect
      </button>
    </form>
  );
}
