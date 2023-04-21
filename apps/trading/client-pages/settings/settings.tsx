import { t } from '@vegaprotocol/i18n';
import { TelemetryApproval } from '../../components/welcome-dialog/telemetry-approval';
import {
  Divider,
  RoundedWrapper,
  ThemeSwitcher,
} from '@vegaprotocol/ui-toolkit';

export const Settings = () => {
  return (
    <div className="py-4 px-8 flex w-full justify-center">
      <div className="min-w-[300px] ">
        <div className="text-3xl uppercase font-alpha liga calt">
          {t('Settings')}
        </div>
        <div className="text-sm">{t('Changes are applied automatically')}</div>
        <div className="flex mt-10 w-full">
          <RoundedWrapper paddingBottom>
            <ThemeSwitcher withSettings />
            <Divider />
            <TelemetryApproval />
          </RoundedWrapper>
        </div>
      </div>
    </div>
  );
};
