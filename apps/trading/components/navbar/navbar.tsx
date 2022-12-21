import classNames from 'classnames';
import { NavLink, Link } from 'react-router-dom';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useLinks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { NewTab, ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
import { Links } from '../../pages/client-router';
import {
  getNavLinkClassNames,
  getActiveNavLinkClassNames,
  Nav,
} from '@vegaprotocol/ui-toolkit';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

export const Navbar = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const tokenLink = useLinks(DApp.Token);
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const tradingPath = marketId
    ? Links.MARKET(marketId)
    : Links.SKELETON_MARKET();
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
        name={t('Markets')}
        path={Links.MARKETS()}
        navbarTheme={navbarTheme}
        end
      />
      <AppNavLink
        name={t('Trading')}
        path={tradingPath}
        navbarTheme={navbarTheme}
      />
      <AppNavLink
        name={t('Portfolio')}
        path={Links.PORTFOLIO()}
        navbarTheme={navbarTheme}
      />
      <a
        href={tokenLink(TOKEN_GOVERNANCE)}
        target="_blank"
        rel="noreferrer"
        className={getActiveNavLinkClassNames(false, navbarTheme)}
      >
        <span className="flex items-center gap-2">
          {t('Governance')}
          <NewTab />
        </span>
      </a>
      <div className="flex items-center gap-2 ml-auto">
        <VegaWalletConnectButton />
        <ThemeSwitcher />
      </div>
    </Nav>
  );
};

interface AppNavLinkProps {
  name: string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  target?: HTMLAttributeAnchorTarget;
  end?: boolean;
}

const AppNavLink = ({
  name,
  path,
  navbarTheme,
  target,
  testId = name,
  end,
}: AppNavLinkProps) => {
  const borderClasses = classNames('absolute h-1 w-full bottom-[-1px] left-0', {
    'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
    'bg-black': navbarTheme === 'yellow',
  });
  return (
    <NavLink
      data-testid={testId}
      to={{ pathname: path }}
      className={getNavLinkClassNames(navbarTheme)}
      target={target}
      end={end}
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
