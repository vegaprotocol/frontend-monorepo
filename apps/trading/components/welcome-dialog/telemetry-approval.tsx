import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

interface Props {
  telemetryValue: string;
  setTelemetryValue: (value: string) => void;
}

export const TelemetryApproval = ({
  telemetryValue,
  setTelemetryValue,
}: Props) => {
  return (
    <div className="flex flex-col">
      <div className="mr-4" role="form">
        <p className="mb-4">
          {t(
            'Help us identify bugs and improve Vega Governance by sharing anonymous usage data.'
          )}
        </p>
        <div className="flex items-start mb-2 gap-3">
          <VegaIcon name={VegaIconNames.EYE_OFF} size={18} />
          <div className="flex flex-col gap-1">
            <h6 className="font-semibold">{t('Anonymous')}</h6>
            <p className="text-muted">
              {t('Your identity is always anonymous on Vega')}
            </p>
          </div>
        </div>
        <div className="flex items-start mb-4 gap-3">
          <VegaIcon name={VegaIconNames.COG} size={18} />
          <div className="flex flex-col gap-1">
            <h6 className="font-semibold">{t('Optional')}</h6>
            <p className="text-muted">
              {t('You can opt out any time via settings')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-around gap-2">
          <TradingButton
            onClick={() => setTelemetryValue('false')}
            size="small"
            intent={Intent.None}
            data-testid="do-not-share-data-button"
            fill
          >
            {t('No thanks')}
          </TradingButton>

          <TradingButton
            onClick={() => setTelemetryValue('true')}
            intent={Intent.Info}
            data-testid="share-data-button"
            size="small"
            fill
          >
            {telemetryValue === 'true'
              ? t('Continue sharing data')
              : t('Share data')}
          </TradingButton>
        </div>
      </div>
    </div>
  );
};
