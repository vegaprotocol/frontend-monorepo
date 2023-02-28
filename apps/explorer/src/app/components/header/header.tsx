import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { ThemeSwitcher, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { Search } from '../search';
import { Routes } from '../../routes/route-names';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { useNavStore } from '../nav';

export const Header = () => {
  const [open, toggle] = useNavStore((state) => [state.open, state.toggle]);
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
        onClick={() => toggle()}
      >
        <Icon name={open ? 'cross' : 'menu'} />
      </button>
      <Search />
      <ThemeSwitcher className="-my-4" />
    </header>
  );
};
