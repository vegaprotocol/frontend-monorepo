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
    <div className="flex flex-col py-3">
      <div className="mr-4" role="form">
        <div className="mt-2">
          {t(
            'Help us identify bugs and improve Vega Governance by sharing anonymous usage data.'
          )}
        </div>
        <div className="flex items-center mt-2">
          <VegaIcon name={VegaIconNames.EYE_OFF} size={24} />
          <div className="flex flex-col gap-1 ml-6">
            <div className="font-semibold">{t('Anonymous')}</div>
            <div>{t('Your identity is always anonymous on Vega')}</div>
          </div>
        </div>

        <div className="flex items-center mt-2">
          <VegaIcon name={VegaIconNames.COG} size={24} />
          <div className="flex flex-col gap-1 ml-6">
            <div className="font-semibold">{t('Optional')}</div>
            <div>{t('You can opt out any time via settings')}</div>
          </div>
        </div>
        <div className="flex flex-col justify-around items-center mt-10 gap-4 w-full px-4">
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
