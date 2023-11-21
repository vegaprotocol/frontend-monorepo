import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { ViewConnector } from '../connectors';
import { useVegaWallet } from '../use-vega-wallet';
import { ConnectDialogTitle } from './connect-dialog-elements';
import { useT } from '../use-t';

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
  const t = useT();
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
      <ConnectDialogTitle>{t('VIEW AS VEGA USER')}</ConnectDialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="view-connector-form">
        <p className="mb-4">
          {t(
            'Browse from the perspective of another Vega user in read-only mode.'
          )}
        </p>
        <TradingFormGroup label={t('Vega Pubkey')} labelFor="address">
          <TradingInput
            {...register('address', {
              required: t('Required'),
              validate: validatePubkey,
            })}
            id="address"
            data-testid="address"
            type="text"
          />
          {errors.address?.message && (
            <TradingInputError intent="danger">
              {errors.address.message}
            </TradingInputError>
          )}
        </TradingFormGroup>
        <TradingButton
          data-testid="connect"
          intent={Intent.Info}
          type="submit"
          fill
        >
          {t('Browse network')}
        </TradingButton>
        {reset && (
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="p-2 text-sm"
              data-testid="back-button"
            >
              <VegaIcon name={VegaIconNames.ARROW_LEFT} />{' '}
              <span className="underline underline-offset-4">
                {t('Go back')}
              </span>
            </button>
          </div>
        )}
      </form>
    </>
  );
}
