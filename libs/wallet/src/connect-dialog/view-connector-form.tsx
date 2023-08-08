import { t } from '@vegaprotocol/i18n';
import {
  FormGroup,
  Input,
  InputError,
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { ViewConnector } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';

interface FormFields {
  address: string;
}

interface ViewConnectorFormProps {
  connector: ViewConnector;
  onConnect: (connector: ViewConnector) => void;
  reset?: () => void;
}

export function ViewConnectorForm({
  connector,
  onConnect,
  reset,
}: ViewConnectorFormProps) {
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
      <form onSubmit={handleSubmit(onSubmit)} data-testid="view-connector-form">
        <h1 className="text-2xl uppercase mb-6 font-alpha calt">
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
        <TradingButton
          data-testid="connect"
          intent={Intent.Info}
          type="submit"
          className="w-full"
        >
          {t('Browse network')}
        </TradingButton>
        {reset && (
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="p-2 text-sm underline"
              data-testid="back-button"
            >
              <VegaIcon name={VegaIconNames.ARROW_LEFT} /> {t('Go back')}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
