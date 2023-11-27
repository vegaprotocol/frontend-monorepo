import { t } from '@vegaprotocol/i18n';
import {
  Dialog,
  Intent,
  Switch,
  ToastPositionSetter,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useState, type ReactNode } from 'react';

export const Settings = () => {
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
        <label className="text-sm">{label}</label>
        {helpText && <p className="text-muted text-xs">{helpText}</p>}
      </div>
      {children}
    </div>
  );
};
