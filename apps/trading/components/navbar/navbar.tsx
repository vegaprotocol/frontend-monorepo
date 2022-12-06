import classNames from 'classnames';
import { NavLink, Link } from 'react-router-dom';
import { NetworkSwitcher, useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
import { Routes } from '../../pages/client-router';
import {
  getNavLinkClassNames,
  getActiveNavLinkClassNames,
  Nav,
} from '@vegaprotocol/ui-toolkit';

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
  const tradingPath = marketId ? `/markets/${marketId}` : '/markets';
  return (
    <Nav
      navbarTheme={navbarTheme}
      title={t('Console')}
      titleContent={<NetworkSwitcher />}
      icon={
        <Link to="/">
          <Vega className="w-13" />
        </Link>
      }
    >
      <AppNavLink
        name={t('Trading')}
        path={tradingPath}
        navbarTheme={navbarTheme}
      />
      <AppNavLink
        name={t('Portfolio')}
        path={Routes.PORTFOLIO}
        navbarTheme={navbarTheme}
      />
      <div className="flex items-center gap-2 ml-auto">
        <a
          href={`${VEGA_TOKEN_URL}/governance`}
          target="_blank"
          rel="noreferrer"
          className={getActiveNavLinkClassNames(false, navbarTheme, true)}
        >
          {t('Governance')}
        </a>
        <VegaWalletConnectButton />
        <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
      </div>
    </Nav>
  );
};

interface AppNavLinkProps {
  name: string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  alignRight?: boolean;
  target?: HTMLAttributeAnchorTarget;
}

const AppNavLink = ({
  name,
  path,
  navbarTheme,
  alignRight,
  target,
  testId = name,
}: AppNavLinkProps) => {
  const borderClasses = classNames('absolute h-1 w-full bottom-[-1px] left-0', {
    'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
    'bg-black': navbarTheme === 'yellow',
  });
  return (
    <NavLink
      data-testid={testId}
      to={{ pathname: path }}
      className={getNavLinkClassNames(navbarTheme, alignRight)}
      target={target}
    >
      {({ isActive }) => {
        return (
          <>
            {name}
            {isActive && <span className={borderClasses} />}
          </>
        );
      }}
    </NavLink>
  );
};
