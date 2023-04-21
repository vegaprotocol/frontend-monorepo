import { Checkbox } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';

export const TelemetryApproval = () => {
  const [isApproved, setIsApproved] = useTelemetryApproval();
  return (
    <div className="flex flex-col">
      <div className="mr-4" role="form">
        <Checkbox
          label={
            <span className="dark:text-white text-black text-lg pl-1">
              {t('Share usage data')}
            </span>
          }
          checked={isApproved}
          name="telemetry-approval"
          onCheckedChange={() => setIsApproved(!isApproved)}
        />
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 ml-5">
        <span>
          {t(
            'Help identify bugs and improve the service by sharing anonymous usage data. you can change this in your settings at any time.'
          )}
        </span>
      </div>
    </div>
  );
};
