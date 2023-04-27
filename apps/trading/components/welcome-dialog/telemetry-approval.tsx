import { Checkbox } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';

export const TelemetryApproval = ({
  isSettingsPage,
}: {
  isSettingsPage?: boolean;
}) => {
  const [isApproved, setIsApproved] = useTelemetryApproval();
  return (
    <div className="flex flex-col px-2 py-3">
      <div className="mr-4" role="form">
        <Checkbox
          label={<span className="text-lg pl-1">{t('Share usage data')}</span>}
          checked={isApproved}
          name="telemetry-approval"
          onCheckedChange={() => setIsApproved(!isApproved)}
        />
      </div>
      <div className="text-sm text-vega-light-300 dark:text-vega-dark-300 ml-6">
        <span>
          {t(
            'Help identify bugs and improve the service by sharing anonymous usage data.'
          )}
          {!isSettingsPage &&
            ' ' + t('You can change this in your settings at any time.')}
        </span>
      </div>
    </div>
  );
};
