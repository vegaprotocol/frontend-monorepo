import { Button, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

interface Props {
  isApproved: string;
  setApproved: (value: string) => void;
}

export const TelemetryApproval = ({ isApproved, setApproved }: Props) => {
  return (
    <div className="flex flex-col py-3">
      <div className="mr-4" role="form">
        <div className="mt-6">
          {t(
            'Help us identify bugs and improve Vega Governance by sharing anonymous usage data.'
          )}
        </div>
        <div className="flex items-center mt-6">
          <Icon name="eye-off" className="mr-6" size={6} />
          <div className="flex flex-col gap-1">
            <div className="font-semibold">{t('Anonymous')}</div>
            <div>{t('Your identity is always anonymous on Vega')}</div>
          </div>
        </div>

        <div className="flex items-center mt-6">
          <Icon name="cog" className="mr-6" size={6} />
          <div className="flex flex-col gap-1">
            <div className="font-semibold">{t('Optional')}</div>
            <div>{t('You can opt out any time via settings')}</div>
          </div>
        </div>
        <div className="flex justify-around items-center mt-10 gap-4 w-full">
          <Button
            onClick={() => setApproved('false')}
            variant="default"
            data-testid="do-not-share-data-button"
          >
            {t('No thanks')}
          </Button>

          <Button
            onClick={() => setApproved('true')}
            variant="primary"
            data-testid="share-data-button"
          >
            {isApproved === 'true'
              ? t('Continue sharing data')
              : t('Share data')}
          </Button>
        </div>
      </div>
    </div>
  );
};
