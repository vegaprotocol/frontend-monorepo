import { t } from '@vegaprotocol/i18n';
import { TelemetryApproval } from '../../components/welcome-dialog/telemetry-approval';
import {
  Divider,
  RoundedWrapper,
  Switch,
  ThemeSwitcher,
} from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

export const Settings = () => {
  const { theme, setTheme } = useThemeSwitcher();
  const text = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="min-w-[300px]">
        <div className="text-3xl uppercase font-alpha liga calt">
          {t('Settings')}
        </div>
        <div className="text-sm mt-6">
          {t('Changes are applied automatically')}
        </div>
        <div className="flex mt-10 w-full">
          <RoundedWrapper paddingBottom>
            <div className="flex justify-between py-3">
              <div className="flex shrink">
                <ThemeSwitcher />
                <label htmlFor="theme-switcher" className="self-center text-lg">
                  {text}
                </label>
              </div>
              <Switch
                name="settings-theme-switch"
                onCheckedChange={() => setTheme()}
                checked={theme === 'dark'}
              />
            </div>
            <Divider />
            <TelemetryApproval />
          </RoundedWrapper>
        </div>
      </div>
    </div>
  );
};
