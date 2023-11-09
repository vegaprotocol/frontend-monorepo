import { Switch, ToastPositionSetter } from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';

export const Settings = () => {
  const t = useT();
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
          'Help identify bugs and improve the service by sharing anonymous usage data.',
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
      <SettingsGroup inline={false} label={t('App information')}>
        <dl className="text-sm grid grid-cols-2 gap-1">
          {process.env.GIT_TAG && (
            <>
              <dt className="text-muted">{t('Version')}</dt>
              <dd>{process.env.GIT_TAG}</dd>
            </>
          )}
          <dt className="text-muted">{t('Git commit hash')}</dt>
          <dd className="break-words">{process.env.GIT_COMMIT}</dd>
        </dl>
      </SettingsGroup>
    </div>
  );
};

const SettingsGroup = ({
  label,
  helpText,
  children,
  inline = true,
}: {
  label: string;
  children: ReactNode;
  helpText?: string;
  inline?: boolean;
}) => {
  return (
    <div
      className={classNames('mb-4 gap-2', {
        'flex items-start justify-between gap-2': inline,
      })}
    >
      <div className={classNames({ 'w-3/4': inline, 'mb-2': !inline })}>
        <label className="text-sm">{label}</label>
        {helpText && <p className="text-xs text-muted">{helpText}</p>}
      </div>
      {children}
    </div>
  );
};
