import {
  Dialog,
  Intent,
  Switch,
  ToastPositionSetter,
  TradingButton,
  TradingCheckbox,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useState, type ReactNode } from 'react';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import {
  userControllableFeatureFlags,
  useFeatureFlags,
  type FeatureFlags,
} from '@vegaprotocol/environment';

const FeatureFlag = ({
  flag,
  label,
}: {
  flag: keyof FeatureFlags;
  label: string;
}) => {
  const flags = useFeatureFlags((state) => state.flags);
  const setFeatureFlag = useFeatureFlags((state) => state.setFeatureFlag);
  return (
    <div className="mb-2">
      <TradingCheckbox
        checked={flags[flag]}
        label={label}
        onCheckedChange={(checked) => setFeatureFlag(flag, !!checked)}
      />
    </div>
  );
};

export const Settings = () => {
  const t = useT();
  const { theme, setTheme } = useThemeSwitcher();
  const [isApproved, setIsApproved] = useTelemetryApproval();
  const [open, setOpen] = useState(false);
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
      <SettingsGroup label={t('Reset to default')}>
        <TradingButton
          name="reset-to-defaults"
          size="small"
          intent={Intent.None}
          onClick={() => {
            setOpen(true);
          }}
        >
          {t('Reset')}
        </TradingButton>
        <Dialog open={open} title={t('Reset')}>
          <div className="mb-4">
            <p>
              {t(
                'You will lose all persisted settings and you will be logged out.'
              )}
            </p>
            <p>
              {t('Are you sure you want to reset all settings to default?')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <TradingButton
              name="reset-to-defaults-cancel"
              intent={Intent.Primary}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              {t('Yes, clear cache and refresh')}
            </TradingButton>
            <TradingButton
              name="reset-to-defaults-cancel"
              intent={Intent.None}
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('No, keep settings')}
            </TradingButton>
          </div>
        </Dialog>
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
      <SettingsGroup inline={false} label={t('Experimental features')}>
        {userControllableFeatureFlags.map((flag) => (
          <FeatureFlag flag={flag} key={flag} label={flag} />
        ))}
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
