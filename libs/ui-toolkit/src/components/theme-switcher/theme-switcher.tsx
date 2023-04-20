import { t } from '@vegaprotocol/i18n';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { SunIcon, MoonIcon } from './icons';
import { Toggle } from '../toggle';
import { Switch } from '../switch';

export const ThemeSwitcher = ({
  className,
  withMobile,
  withSettings,
}: {
  className?: string;
  withMobile?: boolean;
  withSettings?: boolean;
}) => {
  const { theme, setTheme } = useThemeSwitcher();
  const button = (
    <button
      type="button"
      onClick={() => setTheme()}
      className={className}
      data-testid="theme-switcher"
      id="theme-switcher"
    >
      {theme === 'dark' && <SunIcon />}
      {theme === 'light' && <MoonIcon />}
    </button>
  );
  if (withSettings) {
    const text = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
    return (
      <div className="flex justify-between my-2">
        <div className="flex shrink">
          {button}{' '}
          <label htmlFor="theme-switcher" className="self-center text-md">
            {text}
          </label>
        </div>
        <Switch
          name="settings-theme-switch"
          onCheckedChange={() => setTheme()}
          checked={theme === 'dark'}
        />
      </div>
    );
  }
  const toggles = [
    {
      value: 'dark',
      label: t('Dark mode'),
    },
    {
      value: 'light',
      label: t('Light mode'),
    },
  ];
  return withMobile ? (
    <>
      <div className="flex grow gap-6 md:hidden whitespace-nowrap justify-between">
        {button}{' '}
        <Toggle
          name="theme-switch"
          checkedValue={theme}
          toggles={toggles}
          onChange={() => setTheme()}
          size="sm"
        />
      </div>
      <div className="hidden md:block">{button}</div>
    </>
  ) : (
    button
  );
};
