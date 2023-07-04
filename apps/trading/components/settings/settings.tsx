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
      <SettingsGroup
        label={t('Share usage data')}
        helpText={t(
          'Help identify bugs and improve the service by sharing anonymous usage data.'
        )}
      >
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
  helpText,
  children,
}: {
  label: string;
  helpText?: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="w-3/4">
        <label>{label}</label>
        {helpText && <p className="text-muted text-xs">{helpText}</p>}
      </div>
      {children}
    </div>
  );
};
