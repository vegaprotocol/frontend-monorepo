import { t } from '@vegaprotocol/i18n';
import { TelemetryApproval } from '../../components/welcome-dialog/telemetry-approval';

export const Settings = () => {
  return (
    <div className="py-4 px-8">
      <div className="leading-2 text-2xl uppercase">{t('Settings')}</div>
      <div className="text-sm">{t('Changes are saved automatically')}</div>
      <div className="flex mt-10 max-w-[500px]">
        <div className="align-middle">
          <TelemetryApproval />
        </div>
      </div>
    </div>
  );
};
