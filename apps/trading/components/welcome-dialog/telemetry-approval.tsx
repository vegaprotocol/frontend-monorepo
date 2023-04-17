import { Toggle } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';

export const TelemetryApproval = () => {
  const [isApproved, setIsApproved] = useTelemetryApproval();
  const toggles = [
    {
      value: 'true',
      label: t('Yes'),
    },
    {
      value: 'false',
      label: t('No'),
    },
  ];
  return (
    <div className="flex">
      <div className="mr-4" role="form">
        <Toggle
          name="telemetry-approval"
          checkedValue={isApproved ? 'true' : 'false'}
          toggles={toggles}
          onChange={() => setIsApproved(!isApproved)}
          size="sm"
        />
      </div>
      <div className="text-center text-sm">
        {t(
          'Do you agree to us collecting error and performance data when you use this site?'
        )}
      </div>
    </div>
  );
};
