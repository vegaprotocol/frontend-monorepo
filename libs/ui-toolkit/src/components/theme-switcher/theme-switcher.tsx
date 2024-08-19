import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { Toggle } from '../toggle';
import { useT } from '../../use-t';
import { cn } from '../../utils/cn';
import { VegaIcon, VegaIconNames } from '../icon';

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
      className={cn(
        'flex justify-center items-center hover:bg-surface-3 rounded-full w-7 h-7',
        className
      )}
      data-testid="theme-switcher"
      id="theme-switcher"
    >
      {theme === 'dark' && <VegaIcon name={VegaIconNames.SUN} size={28} />}
      {theme === 'light' && <VegaIcon name={VegaIconNames.MOON} size={28} />}
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
