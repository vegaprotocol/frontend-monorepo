import {
  Intent,
  Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

interface Props {
  telemetryValue: string;
  setTelemetryValue: (value: string) => void;
}

export const TelemetryApproval = ({
  telemetryValue,
  setTelemetryValue,
}: Props) => {
  const t = useT();
  return (
    <div className="flex flex-col">
      <div className="mr-4" role="form">
        <p className="mb-4">{t('TelemetryModalIntro')}</p>
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
          <Button
            onClick={() => setTelemetryValue('true')}
            intent={Intent.Info}
            data-testid="share-data-button"
            size="sm"
            fill
          >
            {telemetryValue === 'true'
              ? t('Continue sharing data')
              : t('Share data')}
          </Button>

          <Button
            onClick={() => setTelemetryValue('false')}
            size="sm"
            intent={Intent.None}
            data-testid="do-not-share-data-button"
            fill
          >
            {t('No thanks')}
          </Button>
        </div>
      </div>
    </div>
  );
};
