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
import { Links, Routes } from '../../pages/client-router';
import {
  getNavLinkClassNames,
  getActiveNavLinkClassNames,
  Nav,
} from '@vegaprotocol/ui-toolkit';
import { useMemo, useState, useCallback } from 'react';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

const LinkList = ({
  navbarTheme,
  className = 'flex',
}: {
  navbarTheme: NavbarTheme;
  className?: string;
}) => {
  const tokenLink = useLinks(DApp.Token);
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();
  return (
    <div className={className}>
      <AppNavLink
        name={t('Markets')}
        path={Links[Routes.MARKETS]()}
        navbarTheme={navbarTheme}
        end
      />
      <AppNavLink
        name={t('Trading')}
        path={tradingPath}
        navbarTheme={navbarTheme}
        end
      />
      <AppNavLink
        name={t('Portfolio')}
        path={Links[Routes.PORTFOLIO]()}
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
    </div>
  );
};

const MobileMenuBar = ({ navbarTheme }: { navbarTheme: NavbarTheme }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onOpen = useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen]);

  return (
    <div className="flex overflow-hidden md:hidden">
      <button
        className="flex flex-col justify-around gap-3 p-2 relative z-30 h-[34px]"
        onClick={onOpen}
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
            '-translate-y-[7.5px] -rotate-45 bg-black dark:bg-white':
              drawerOpen,
          })}
        />
      </button>
      <div
        className={classNames(
          'h-full max-w-[500px] -right-[90%] z-20 top-0 fixed w-[90vw] transition-all md:hidden',
          {
            'right-0': drawerOpen,
          }
        )}
      >
        <div className="border-l border-default px-4 py-2 gap-4 flex flex-col w-full h-full bg-white dark:bg-black dark:text-white justify-start">
          <div className="flex h-5"></div>
          <div className="px-2 pb-6 w-full flex flex-col items-stretch border-b border-default">
            <NetworkSwitcher />
          </div>
          <LinkList
            className="flex flex-col border-b border-default pb-6"
            navbarTheme={navbarTheme}
          />
          <div className="flex justify-between">
            <ThemeSwitcher withMobile />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Navbar = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const titleContent = useMemo(
    () => (
      <div className="hidden md:block">
        <NetworkSwitcher />
      </div>
    ),
    []
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
    'bg-black dark:bg-vega-yellow md:dark:bg-black': navbarTheme === 'yellow',
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
