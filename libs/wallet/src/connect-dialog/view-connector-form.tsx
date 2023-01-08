import { t } from '@vegaprotocol/react-helpers';
import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { ViewConnector } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';

interface FormFields {
  address: string;
}

interface RestConnectorFormProps {
  connector: ViewConnector;
  onConnect: (connector: ViewConnector) => void;
}

export function ViewConnectorForm({
  connector,
  onConnect,
}: RestConnectorFormProps) {
  const { connect } = useVegaWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  async function onSubmit(fields: FormFields) {
    await connector.setPubkey(fields.address)
    await connect(connector);
    onConnect(connector);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="rest-connector-form">
      <FormGroup label={t('Vega Pubkey')} labelFor="address">
        <Input
          {...register('address', { required: t('Required') })}
          id="address"
          data-testid="rest-wallet"
          type="text"
        />
        {errors.address?.message && (
          <InputError intent="danger">{errors.address.message}</InputError>
        )}
      </FormGroup>
      <Button variant="primary" type="submit" fill={true}>
        {t('Connect')}
      </Button>
    </form>
  );
}
