import {
  Dialog,
  Intent,
  Popover,
  Switch,
  ToastPositionSetter,
  Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useState, type ReactNode } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const SettingsPopover = () => {
  return (
    <Popover
      trigger={
        <span className="flex items-center justify-center w-7 h-7 hover:bg-surface-3  rounded-full">
          <VegaIcon name={VegaIconNames.COG} size={18} />
        </span>
      }
      align="end"
      sideOffset={14}
    >
      <Settings />
    </Popover>
  );
};

export const Settings = () => {
  const t = useT();
  const { theme, setTheme } = useThemeSwitcher();
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3 p-4 w-96">
      <h2 className="font-alt calt uppercase">{t('Settings')}</h2>
      <SettingsGroup label={t('Dark mode')}>
        <Switch
          name="settings-theme-switch"
          onCheckedChange={() => setTheme()}
          checked={theme === 'dark'}
        />
      </SettingsGroup>
      <SettingsGroup label={t('Toast location')}>
        <ToastPositionSetter />
      </SettingsGroup>
      <SettingsGroup label={t('Reset to default')}>
        <Button
          name="reset-to-defaults"
          size="sm"
          intent={Intent.None}
          onClick={() => {
            setOpen(true);
          }}
        >
          {t('Reset')}
        </Button>
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
            <Button
              name="reset-to-defaults-cancel"
              intent={Intent.Primary}
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
            >
              {t('Yes, clear cache and refresh')}
            </Button>
            <Button
              name="reset-to-defaults-cancel"
              intent={Intent.None}
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('No, keep settings')}
            </Button>
          </div>
        </Dialog>
      </SettingsGroup>
      <SettingsGroup inline={false} label={t('App information')}>
        <dl className="text-sm grid grid-cols-2 gap-1">
          {process.env.GIT_TAG && (
            <>
              <dt className="text-surface-1-fg-muted">{t('Version')}</dt>
              <dd>{process.env.GIT_TAG}</dd>
            </>
          )}
          <dt className="text-surface-1-fg-muted">{t('Git commit hash')}</dt>
          <dd className="break-words">{process.env.GIT_COMMIT}</dd>
        </dl>
      </SettingsGroup>
    </section>
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
      className={cn('gap-2', {
        'flex items-start justify-between gap-2': inline,
      })}
    >
      <div className={cn({ 'w-3/4': inline, 'mb-2': !inline })}>
        <label className="text-sm" id={label}>
          {label}
        </label>
        {helpText && (
          <p className="text-xs text-surface-1-fg-muted">{helpText}</p>
        )}
      </div>
      <div aria-describedby={label}>{children}</div>
    </div>
  );
};
