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
          name="settings-telemetry-switch"
          onCheckedChange={(isOn) => setIsApproved(isOn ? 'true' : 'false')}
          checked={isApproved === 'true'}
        />
      </SettingsGroup>
      <SettingsGroup label={t('Toast location')}>
        <ToastPositionSetter />
      </SettingsGroup>
      {process.env.GIT_TAG && (
        <SettingsGroup label={t('App version')}>
          <p className="text-sm whitespace-nowrap">{process.env.GIT_TAG}</p>
        </SettingsGroup>
      )}
      <SettingsGroup label={t('Commit hash')}>
        <p className="text-sm break-words max-w-[100px]">
          {process.env.GIT_COMMIT}
        </p>
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
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className="w-3/4">
        <label className="text-sm">{label}</label>
        {helpText && <p className="text-xs text-muted">{helpText}</p>}
      </div>
      {children}
    </div>
  );
};
