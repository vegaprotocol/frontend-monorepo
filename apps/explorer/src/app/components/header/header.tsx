import type { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Search } from '../search';
import { Routes } from '../../routes/route-names';

interface ThemeToggleProps {
  toggleTheme: () => void;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({
  toggleTheme,
  menuOpen,
  setMenuOpen,
}: ThemeToggleProps) => {
  return (
    <header className="grid grid-rows-2 grid-cols-[1fr_auto] md:flex md:col-span-2 p-16 gap-12 border-b-1">
      <Link to={Routes.HOME}>
        <h1
          className="text-h3 font-alpha uppercase calt mb-2"
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
        <Icon name={menuOpen ? 'cross' : 'menu'} size={20} />
      </button>
      <Search />
      <ThemeSwitcher onToggle={toggleTheme} />
    </header>
  );
};
