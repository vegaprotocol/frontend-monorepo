import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Link } from 'react-router-dom';
import { NetworkSwitcher, useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
import { useEffect, useState } from 'react';
import testnetBg from '../../assets/green-cloud.png';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  navbarTheme?: NavbarTheme;
}

export const Navbar = ({
  theme,
  toggleTheme,
  navbarTheme = 'inherit',
}: NavbarProps) => {
  const { VEGA_TOKEN_URL } = useEnvironment();
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const [tradingPath, setTradingPath] = useState('/markets');

  useEffect(() => {
    if (marketId) {
      setTradingPath(`/markets/${marketId}`);
    }
  }, [marketId]);

  const themeWrapperClasses = classNames({
    dark: navbarTheme === 'dark',
  });

  const isYellow = navbarTheme === 'yellow';
  const navbarClasses = classNames(
    'flex items-stretch border-b px-4 border-default',
    {
      'dark:bg-black dark:text-white': !isYellow,
      'bg-vega-yellow text-black bg-right-top bg-no-repeat bg-contain':
        isYellow,
    }
  );

  return (
    <div className={themeWrapperClasses}>
      <div
        className={navbarClasses}
        style={{
          backgroundImage: isYellow ? `url("${testnetBg.src}")` : '',
        }}
      >
        <div className="flex gap-4 items-center">
          <Link to="/">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <Vega className="w-13" />
            </a>
          </Link>
          <NetworkSwitcher />
        </div>
        <nav className="flex items-center flex-1 px-2">
          <NavLink
            name={t('Trading')}
            path={tradingPath}
            navbarTheme={navbarTheme}
          />
          <NavLink
            name={t('Portfolio')}
            path="/portfolio"
            navbarTheme={navbarTheme}
          />
          <NavLink
            name={t('Governance')}
            path={`${VEGA_TOKEN_URL}/governance`}
            alignRight={true}
            target="_blank"
            navbarTheme={navbarTheme}
          />
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <VegaWalletConnectButton />
          <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  name: string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  alignRight?: boolean;
  target?: HTMLAttributeAnchorTarget;
}

const NavLink = ({
  name,
  path,
  navbarTheme,
  alignRight,
  target,
  testId = name,
}: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.asPath?.includes(path);
  const linkClasses = classNames('mx-2 py-3 self-end relative', {
    'cursor-default': isActive,
    'text-black dark:text-white': isActive && navbarTheme !== 'yellow',
    'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-300':
      !isActive && navbarTheme !== 'yellow',
    'ml-auto': alignRight,
    'text-black': isActive && navbarTheme === 'yellow',
    'text-black/60 hover:text-black': !isActive && navbarTheme === 'yellow',
  });
  const borderClasses = classNames('absolute h-1 w-full bottom-[-1px] left-0', {
    'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
    'bg-black': navbarTheme === 'yellow',
  });
  return (
    <Link
      data-testid={testId}
      to={path}
      className={linkClasses}
      target={target}
    >
      {name}
      {isActive && <span className={borderClasses} />}
    </Link>
  );
};
