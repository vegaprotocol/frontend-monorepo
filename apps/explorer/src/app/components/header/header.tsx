import type { Dispatch, SetStateAction } from 'react';
import { ThemeSwitcher, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Search } from '../search';

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
      <h1
        className="text-h3 font-alpha uppercase calt"
        data-testid="explorer-header"
      >
        {t('Vega Explorer')}
      </h1>
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        <Icon name={menuOpen ? 'cross' : 'menu'} size={20} />
      </button>
      <Search />
      <ThemeSwitcher onToggle={toggleTheme} />
    </header>
  );
};
