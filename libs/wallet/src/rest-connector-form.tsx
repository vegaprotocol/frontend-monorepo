import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { RestConnector } from '.';
import { useVegaWallet } from './use-vega-wallet';

interface FormFields {
  url: string;
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
  const { VEGA_WALLET_URL } = useEnvironment();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      url: VEGA_WALLET_URL,
    },
  });

  async function onSubmit(fields: FormFields) {
    const authFailedMessage = t('Authentication failed');
    try {
      setError('');
      const res = await connector.authenticate(fields.url, {
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
        setError(t(`Wallet not running at ${fields.url}`));
      } else if (err instanceof Error) {
        setError(authFailedMessage);
      } else {
        setError(t('Something went wrong'));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="rest-connector-form">
      <FormGroup label={t('Url')} labelFor="url">
        <Input
          {...register('url', { required: t('Required') })}
          id="url"
          type="text"
        />
        {errors.url?.message && (
          <InputError intent="danger">{errors.url.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label={t('Wallet')} labelFor="wallet">
        <Input
          {...register('wallet', { required: t('Required') })}
          id="wallet"
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
      <Button variant="primary" type="submit">
        {t('Connect')}
      </Button>
    </form>
  );
}
