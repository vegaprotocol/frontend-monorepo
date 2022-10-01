import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { LocalStorage, t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const { marketId, update } = useGlobalStore((store) => ({
    marketId: store.marketId || LocalStorage.getItem('marketId'),
    update: store.update,
  }));
  const tradingPath = marketId ? `/markets/${marketId}` : '/';
  return (
    <div className="dark px-4 flex items-stretch border-b border-default bg-black text-white">
      <div className="flex gap-4 mr-4 items-center h-full">
        <Link href="/" passHref={true}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <Vega className="w-13" />
          </a>
        </Link>
        <NetworkSwitcher />
      </div>
      <nav className="flex items-center">
        <NavLink key={'trading'} name={t('Trading')} path={tradingPath} />
        <NavLink key={'portfolio'} name={t('Portfolio')} path={'/portfolio'} />
      </nav>
      <div className="flex items-center gap-2 ml-auto">
        <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
        <VegaWalletConnectButton
          setConnectDialog={(open) => update({ connectDialog: open })}
        />
      </div>
    </div>
  );
};

interface NavLinkProps {
  name: string;
  path: string;
  testId?: string;
}

const NavLink = ({ name, path, testId = name }: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.asPath.includes(path);
  const linkClasses = classNames('mx-2 py-2 self-end border-b-4', {
    'border-vega-yellow text-white cursor-default': isActive,
    'border-transparent text-neutral-400 hover:text-neutral-300': !isActive,
  });
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={linkClasses}>{name}</a>
    </Link>
  );
};
