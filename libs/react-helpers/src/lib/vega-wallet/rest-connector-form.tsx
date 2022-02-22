import { useForm } from 'react-hook-form';
import { useVegaWallet } from '.';
import { Connectors } from './connect-dialog';

interface FormFields {
  wallet: string;
  passphrase: string;
}

interface RestConnectorFormProps {
  setDialogOpen: (isOpen: boolean) => void;
}

export function RestConnectorForm({ setDialogOpen }: RestConnectorFormProps) {
  const { connect } = useVegaWallet();
  const { register, handleSubmit } = useForm<FormFields>();

  async function onSubmit(fields: FormFields) {
    try {
      const success = await Connectors.rest.authenticate({
        wallet: fields.wallet,
        passphrase: fields.passphrase,
      });

      if (success) {
        connect(Connectors.rest);
        setDialogOpen(false);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vega-wallet-form">
      <div className="mb-5">
        <input
          {...register('wallet')}
          type="text"
          placeholder="Wallet"
          className="text-black"
        />
      </div>
      <div className="mb-5">
        <input
          {...register('passphrase')}
          type="text"
          placeholder="Passphrase"
          className="text-black"
        />
      </div>
      <button type="submit">Connect</button>
    </form>
  );
}
