import { t } from '@vegaprotocol/i18n';
import { Switch, ToastPositionSetter } from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import type { ReactNode } from 'react';

export const Settings = () => {
  const { theme, setTheme } = useThemeSwitcher();
  const [isApproved, setIsApproved] = useTelemetryApproval();
  return (
    <div>
      <SettingsGroup label={t('Dark mode')}>
        <Switch
          name="settings-theme-switch"
          onCheckedChange={() => setTheme()}
          checked={theme === 'dark'}
        />
      </SettingsGroup>
      <SettingsGroup label={t('Share usage data')}>
        <Switch
          name="settings-theme-switch"
          onCheckedChange={(isOn) => setIsApproved(isOn)}
          checked={isApproved}
        />
      </SettingsGroup>
      <SettingsGroup label={t('Toast location')}>
        <ToastPositionSetter />
      </SettingsGroup>
    </div>
  );
};

const SettingsGroup = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex justify-between mb-4">
      <label className="text-neutral-500 dark:text-neutral-400">{label}</label>
      {children}
    </div>
  );
};
