import { t } from '@vegaprotocol/i18n';
import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { RestConnector } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';

interface FormFields {
  wallet: string;
  passphrase: string;
}

interface RestConnectorFormProps {
  connector: RestConnector;
  onConnect: (connector: RestConnector) => void;
}

export function RestConnectorForm({
  connector,
  onConnect,
}: RestConnectorFormProps) {
  const { connect } = useVegaWallet();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  async function onSubmit(fields: FormFields) {
    const authFailedMessage = t('Authentication failed');
    try {
      setError('');
      const res = await connector.authenticate({
        wallet: fields.wallet,
        passphrase: fields.passphrase,
      });

      if (res.success) {
        await connect(connector);
        onConnect(connector);
      } else {
        setError(res.error || authFailedMessage);
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError(t(`Wallet not running at ${connector.url}`));
      } else if (err instanceof Error) {
        setError(authFailedMessage);
      } else {
        setError(t('Something went wrong'));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="rest-connector-form">
      <FormGroup label={t('Wallet name')} labelFor="wallet">
        <Input
          {...register('wallet', { required: t('Required') })}
          id="wallet"
          data-testid="rest-wallet"
          type="text"
        />
        {errors.wallet?.message && (
          <InputError intent="danger">{errors.wallet.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label={t('Passphrase')} labelFor="passphrase">
        <Input
          {...register('passphrase', { required: t('Required') })}
          id="passphrase"
          data-testid="rest-passphrase"
          type="password"
        />
        {errors.passphrase?.message && (
          <InputError intent="danger">{errors.passphrase.message}</InputError>
        )}
        {error && (
          <InputError intent="danger" data-testid="form-error">
            {error}
          </InputError>
        )}
      </FormGroup>
      <Button variant="primary" type="submit" fill={true}>
        {t('Connect')}
      </Button>
    </form>
  );
}
