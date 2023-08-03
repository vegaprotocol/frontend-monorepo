import { t } from '@vegaprotocol/i18n';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { ViewConnector } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';

interface FormFields {
  address: string;
}

interface RestConnectorFormProps {
  connector: ViewConnector;
  onConnect: (connector: ViewConnector) => void;
  reset?: () => void;
}

export function ViewConnectorForm({
  connector,
  onConnect,
  reset,
}: RestConnectorFormProps) {
  const { connect } = useVegaWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  const validatePubkey = (value: string) => {
    const number = +`0x${value}`;
    if (value.length !== 64) {
      return t('Pubkey must be 64 characters in length');
    } else if (Number.isNaN(number)) {
      return t('Pubkey must be be valid hex');
    }
    return true;
  };

  async function onSubmit(fields: FormFields) {
    await connector.setPubkey(fields.address);
    await connect(connector);
    onConnect(connector);
  }

  return (
    <>
      {reset && (
        <button
          onClick={reset}
          className="absolute p-2 top-0 left-0 md:top-2 md:left-2"
          data-testid="back-button"
        >
          <VegaIcon
            name={VegaIconNames.CHEVRON_LEFT}
            aria-label="back"
            size={16}
          />
        </button>
      )}
      <form onSubmit={handleSubmit(onSubmit)} data-testid="view-connector-form">
        <h1 className="text-2xl uppercase mb-6 text-center font-alpha calt">
          {t('VIEW AS VEGA USER')}
        </h1>
        <p className="mb-4">
          {t(
            'Browse from the perspective of another Vega user in read-only mode.'
          )}
        </p>
        <FormGroup label={t('Vega Pubkey')} labelFor="address">
          <Input
            {...register('address', {
              required: t('Required'),
              validate: validatePubkey,
            })}
            id="address"
            data-testid="address"
            type="text"
          />
          {errors.address?.message && (
            <InputError intent="danger">{errors.address.message}</InputError>
          )}
        </FormGroup>
        <Button
          data-testid="connect"
          variant="primary"
          type="submit"
          fill={true}
        >
          {t('Browse network')}
        </Button>
      </form>
    </>
  );
}
