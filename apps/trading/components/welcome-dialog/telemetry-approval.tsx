import { Checkbox } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';

export const TelemetryApproval = ({ helpText }: { helpText: string }) => {
  const [isApproved, setIsApproved] = useTelemetryApproval();
  return (
    <div className="flex flex-col py-3">
      <div className="mr-4" role="form">
        <Checkbox
          label={<span className="text-lg pl-1">{t('Share usage data')}</span>}
          checked={isApproved}
          name="telemetry-approval"
          onCheckedChange={() => setIsApproved(!isApproved)}
        />
      </div>
      <div className="text-sm text-vega-light-300 dark:text-vega-dark-300 ml-6">
        <span>{helpText}</span>
      </div>
    </div>
  );
};
