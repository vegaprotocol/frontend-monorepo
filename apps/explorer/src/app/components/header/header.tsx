import type { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Search } from '../search';
import { Routes } from '../../routes/route-names';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({
  theme,
  toggleTheme,
  menuOpen,
  setMenuOpen,
}: ThemeToggleProps) => {
  return (
    <header className="grid grid-rows-2 grid-cols-[1fr_auto] md:flex md:col-span-2 px-4 py-2 gap-2 md:gap-4 border-b border-neutral-700 dark:border-neutral-300">
      <Link to={Routes.HOME}>
        <h1
          className="text-2xl font-alpha uppercase calt mb-2"
          data-testid="explorer-header"
        >
          {t('Vega Explorer')}
        </h1>
      </Link>
      <button
        data-testid="open-menu"
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name={menuOpen ? 'cross' : 'menu'} />
      </button>
      <Search />
      <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
    </header>
  );
};
