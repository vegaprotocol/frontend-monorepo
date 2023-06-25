import { t } from '@vegaprotocol/i18n';
import { TelemetryApproval } from '../../components/welcome-dialog/telemetry-approval';
import {
  Divider,
  Switch,
  ThemeSwitcher,
  ToastPositionSetter,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

export const Settings = () => {
  const { theme, setTheme } = useThemeSwitcher();
  const text = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
  return (
    <div>
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
    </div>
  );
};
