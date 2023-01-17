import { useState } from 'react';
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
import { Drawer, NewTab, ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
import { Links, Routes } from '../../pages/client-router';
import {
  getNavLinkClassNames,
  getActiveNavLinkClassNames,
  Nav,
} from '@vegaprotocol/ui-toolkit';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

const LinkList = ({
  navbarTheme,
  className = 'flex',
  dataTestId = 'navbar-links',
  onNavigate,
}: {
  navbarTheme: NavbarTheme;
  className?: string;
  dataTestId?: string;
  onNavigate?: () => void;
}) => {
  const tokenLink = useLinks(DApp.Token);
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();
  return (
    <div className={className} data-testid={dataTestId}>
      <AppNavLink
        name={t('Markets')}
        path={Links[Routes.MARKETS]()}
        navbarTheme={navbarTheme}
        onClick={onNavigate}
        end
      />
      <AppNavLink
        name={t('Trading')}
        path={tradingPath}
        navbarTheme={navbarTheme}
        onClick={onNavigate}
        end
      />
      <AppNavLink
        name={t('Portfolio')}
        path={Links[Routes.PORTFOLIO]()}
        navbarTheme={navbarTheme}
        onClick={onNavigate}
      />
      <a
        href={tokenLink(TOKEN_GOVERNANCE)}
        target="_blank"
        rel="noreferrer"
        className={classNames(
          'w-full md:w-auto',
          getActiveNavLinkClassNames(false, navbarTheme)
        )}
      >
        <span className="flex items-center justify-between w-full gap-2 pr-3 md:pr-0">
          {t('Governance')}
          <NewTab />
        </span>
      </a>
    </div>
  );
};

const MobileMenuBar = ({ navbarTheme }: { navbarTheme: NavbarTheme }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const menuButton = (
    <button
      className={classNames(
        'flex flex-col justify-around gap-3 p-2 relative z-30 h-[34px]',
        {
          'z-50': drawerOpen,
        }
      )}
      onClick={() => setDrawerOpen(!drawerOpen)}
      data-testid="button-menu-drawer"
    >
      <div
        className={classNames('w-[26px] h-[2px] transition-all', {
          'translate-y-0 rotate-0 bg-white': !drawerOpen,
          'bg-black': !drawerOpen && navbarTheme === 'yellow',
          'translate-y-[7.5px] rotate-45 bg-black dark:bg-white': drawerOpen,
        })}
      />
      <div
        className={classNames('w-[26px] h-[2px] transition-all', {
          'translate-y-0 rotate-0 bg-white': !drawerOpen,
          'bg-black': !drawerOpen && navbarTheme === 'yellow',
          '-translate-y-[7.5px] -rotate-45 bg-black dark:bg-white': drawerOpen,
        })}
      />
    </button>
  );

  return (
    <div className="flex overflow-hidden md:hidden" ref={setContainer}>
      <Drawer
        dataTestId="menu-drawer"
        open={drawerOpen}
        onChange={setDrawerOpen}
        container={container}
        trigger={menuButton}
      >
        <div className="border-l border-default px-4 py-2 gap-4 flex flex-col w-full h-full bg-white dark:bg-black dark:text-white justify-start">
          <div className="w-full h-1"></div>
          <div className="px-2 pt-10 w-full flex flex-col items-stretch">
            <NetworkSwitcher />
            <div className="w-full pt-8 h-1 border-b border-default"></div>
          </div>
          <LinkList
            className="flex flex-col"
            navbarTheme={navbarTheme}
            dataTestId="mobile-navbar-links"
            onNavigate={() => setDrawerOpen(false)}
          />
          <div className="flex flex-col px-2 justify-between">
            <div className="w-full h-1 border-t border-default py-5"></div>
            <ThemeSwitcher withMobile />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export const Navbar = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const titleContent = (
    <div className="hidden md:block">
      <NetworkSwitcher />
    </div>
  );
  return (
    <Nav
      navbarTheme={navbarTheme}
      title={t('Console')}
      titleContent={titleContent}
      icon={
        <Link to="/">
          <Vega className="w-13" />
        </Link>
      }
    >
      <LinkList className="hidden md:flex" navbarTheme={navbarTheme} />
      <div className="flex items-center gap-2 ml-auto overflow-hidden">
        <VegaWalletConnectButton />
        <ThemeSwitcher className="hidden md:block" />
        <MobileMenuBar navbarTheme={navbarTheme} />
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
  onClick?: () => void;
}

const AppNavLink = ({
  name,
  path,
  navbarTheme,
  target,
  testId = name,
  end,
  onClick,
}: AppNavLinkProps) => {
  const borderClasses = classNames(
    'absolute h-[2px] md:h-1 w-full bottom-[-1px] left-0',
    {
      'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
      'bg-black dark:bg-vega-yellow md:dark:bg-black': navbarTheme === 'yellow',
    }
  );
  return (
    <NavLink
      data-testid={testId}
      to={{ pathname: path }}
      className={getNavLinkClassNames(navbarTheme)}
      onClick={onClick}
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
