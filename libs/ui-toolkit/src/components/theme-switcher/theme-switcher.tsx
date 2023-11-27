import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { SunIcon, MoonIcon } from './icons';
import { Toggle } from '../toggle';
import { useT } from '../../use-t';

export const ThemeSwitcher = ({
  className,
  withMobile,
}: {
  className?: string;
  withMobile?: boolean;
}) => {
  const t = useT();
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
      <div className="flex grow justify-between gap-6 whitespace-nowrap md:hidden">
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
