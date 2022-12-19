import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { ThemeSwitcher, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Search } from '../search';
import { Routes } from '../../routes/route-names';
import type { Dispatch, SetStateAction } from 'react';
import { NetworkSwitcher } from '@vegaprotocol/environment';

interface ThemeToggleProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({ menuOpen, setMenuOpen }: ThemeToggleProps) => {
  const headerClasses = classnames(
    'md:col-span-2',
    'grid grid-rows-2 md:grid-rows-1 grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center',
    'p-4 gap-2 md:gap-4',
    'border-b border-neutral-700 dark:border-neutral-300 bg-black',
    'dark text-white'
  );
  return (
    <header className={headerClasses}>
      <div className="flex h-full items-center sm:items-stretch gap-4">
        <Link to={Routes.HOME}>
          <h1
            className="text-white text-3xl font-alpha uppercase calt mb-0"
            data-testid="explorer-header"
          >
            {t('Vega Explorer')}
          </h1>
        </Link>
        <NetworkSwitcher />
      </div>
      <button
        data-testid="open-menu"
        className="md:hidden text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name={menuOpen ? 'cross' : 'menu'} />
      </button>
      <Search />
      <ThemeSwitcher className="-my-4" />
    </header>
  );
};
