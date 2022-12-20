import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { SunIcon, MoonIcon } from './icons';

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useThemeSwitcher();
  return (
    <button
      type="button"
      onClick={() => setTheme()}
      className={className}
      data-testid="theme-switcher"
    >
      {theme === 'dark' && <SunIcon />}
      {theme === 'light' && <MoonIcon />}
    </button>
  );
};
