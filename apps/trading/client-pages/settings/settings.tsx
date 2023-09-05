import { t } from '@vegaprotocol/i18n';
import { TelemetryApproval } from '../../components/welcome-dialog/telemetry-approval';
import {
  Divider,
  RoundedWrapper,
  Switch,
  ThemeSwitcher,
  ToastPositionSetter,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

export const Settings = () => {
  const { theme, setTheme } = useThemeSwitcher();
  const text = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="lg:min-w-[700px] min-w-[300px]">
        <h1 className="text-4xl xl:text-5xl uppercase font-alpha calt">
          {t('Settings')}
        </h1>
        <div className="mt-8 text-base text-neutral-500 dark:text-neutral-400">
          {t('Changes are applied automatically.')}
        </div>
        <div className="mt-10 w-full">
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
            <TelemetryApproval
              helpText={t(
                'Help identify bugs and improve the service by sharing anonymous usage data.'
              )}
            />
            <Divider />
            <ToastPositionSetter />
          </RoundedWrapper>
        </div>
      </div>
    </div>
  );
};
