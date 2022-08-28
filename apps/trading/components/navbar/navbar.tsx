import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { Vega } from '../icons/vega';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const store = useGlobalStore();
  const tradingPath = store.marketId ? `/markets/${store.marketId}` : '/';
  return (
    <div className="px-4 flex items-stretch border-b-[1px] border-neutral-300 dark:border-neutral-700 bg-black">
      <nav className="flex items-center gap-4">
        <div className="flex gap-4 items-center h-full">
          <Link href="/" passHref={true}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <Vega className="fill-white" />
            </a>
          </Link>
          <NetworkSwitcher />
        </div>
        {[
          {
            name: t('Trading'),
            path: tradingPath,
            exact: false,
          },
          { name: t('Portfolio'), path: '/portfolio' },
        ].map((route) => (
          <NavLink key={route.path} {...route} />
        ))}
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        <VegaWalletConnectButton
          setConnectDialog={(open) => {
            store.setVegaWalletConnectDialog(open);
          }}
          setManageDialog={(open) => {
            store.setVegaWalletManageDialog(open);
          }}
        />
        <ThemeSwitcher
          theme={theme}
          onToggle={toggleTheme}
          sunClassName="text-white"
        />
      </div>
    </div>
  );
};

interface NavLinkProps {
  name: string;
  path: string;
  exact?: boolean;
  testId?: string;
}

const NavLink = ({ name, path, exact, testId = name }: NavLinkProps) => {
  const router = useRouter();
  const isActive =
    router.asPath === path || (!exact && router.asPath.startsWith(path));
  const linkClasses = classNames(
    'px-4 py-2 self-end',
    'uppercase',
    'text-white',
    'border-b-4',
    {
      'border-vega-yellow': isActive,
      'border-transparent': !isActive,
    }
  );
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={linkClasses}>{name}</a>
    </Link>
  );
};
