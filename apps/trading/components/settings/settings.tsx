import {
  Dialog,
  Intent,
  Switch,
  ToastPositionSetter,
  Tooltip,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useTelemetryApproval } from '../../lib/hooks/use-telemetry-approval';
import { useState, type ReactNode } from 'react';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { useFeatureFlags, type FeatureFlags } from '@vegaprotocol/environment';

export const FeatureFlagSwitch = ({ flag }: { flag: keyof FeatureFlags }) => {
  const flags = useFeatureFlags((state) => state.flags);
  const setFeatureFlag = useFeatureFlags((state) => state.setFeatureFlag);

  return (
    <Switch
      name={`feature-flag-${flag}`}
      onCheckedChange={(checked) => {
        setFeatureFlag(flag, !!checked);
      }}
      checked={flags[flag]}
    />
  );
};

export const Settings = () => {
  const t = useT();
  const { theme, setTheme } = useThemeSwitcher();
  const [isApproved, setIsApproved] = useTelemetryApproval();
  const [open, setOpen] = useState(false);
  const flags = useFeatureFlags((state) => state.flags);

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
                sessionStorage.clear();
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

      <h3 className="mb-4 flex items-center gap-3">
        <span>{t('Experimental features')}</span>
        <Tooltip
          description={t(
            'The below features are experimental and it is not guaranteed that they will work correctly. Use at your own risk.'
          )}
        >
          <span className="w-3 h-3 relative text-vega-red">
            <VegaIcon
              name={VegaIconNames.WARNING}
              size={12}
              className="absolute top-0 left-0"
            />
          </span>
        </Tooltip>
      </h3>
      <div className="border-2 rounded border-vega-red bg-vega-red-300 dark:bg-vega-red-700 px-2 pt-4 pb-0">
        <SettingsGroup
          label={t('Cross chain deposits')}
          helpText={t(
            'Enables the cross chain deposit functionality via the Squid Router'
          )}
        >
          <FeatureFlagSwitch flag={'CROSS_CHAIN_DEPOSITS'} />
        </SettingsGroup>
        {flags.CROSS_CHAIN_DEPOSITS && (
          <SettingsGroup
            label={t('Use test Arbitrum bridge')}
            helpText={t(
              'Uses hardcoded assets and Arbitrum bridge (address: 0xd459fac6647059100ebe45543e1da73b3b70ffba). FUNDS MAY BE LOST!'
            )}
          >
            <FeatureFlagSwitch flag={'CROSS_CHAIN_DEPOSITS_TEST'} />
          </SettingsGroup>
        )}
      </div>
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
        <div className="text-sm">{label}</div>
        {helpText && <p className="text-xs text-muted">{helpText}</p>}
      </div>
      {children}
    </div>
  );
};
