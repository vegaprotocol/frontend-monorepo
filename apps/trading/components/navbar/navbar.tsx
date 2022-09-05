import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher, VLogo } from '@vegaprotocol/ui-toolkit';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const { marketId, update } = useGlobalStore((store) => ({
    marketId: store.marketId,
    update: store.update,
  }));
  const tradingPath = marketId ? `/markets/${marketId}` : '/markets';
  return (
    <div className="px-4 flex items-stretch border-b border-neutral-300 dark:border-neutral-700 bg-black">
      <div className="flex gap-4 mr-4 items-center h-full">
        <Link href="/" passHref={true}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <VLogo className="w-6 h-6 fill-white" />
          </a>
        </Link>
        <NetworkSwitcher />
      </div>
      <nav className="flex items-center">
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
      <div className="flex items-center gap-2 ml-auto">
        <ThemeSwitcher
          theme={theme}
          onToggle={toggleTheme}
          sunClassName="text-white"
          fixedBg="dark"
        />
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
  exact?: boolean;
  testId?: string;
}

const NavLink = ({ name, path, exact, testId = name }: NavLinkProps) => {
  const router = useRouter();
  const isActive =
    router.asPath === path || (!exact && router.asPath.startsWith(path));
  const linkClasses = classNames('mx-2 py-2 self-end border-b-4', {
    'border-vega-yellow text-white cursor-default': isActive,
    'border-transparent text-neutral-400': !isActive,
  });
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={linkClasses}>{name}</a>
    </Link>
  );
};
