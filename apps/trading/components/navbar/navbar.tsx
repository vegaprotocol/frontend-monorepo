import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useEnvironment,
  useLinks,
  DocsLinks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  Navigation,
  NavigationList,
  NavigationItem,
  NavigationLink,
  ExternalLink,
  NavigationBreakpoint,
  NavigationTrigger,
  NavigationContent,
  VegaIconNames,
  VegaIcon,
  VLogo,
} from '@vegaprotocol/ui-toolkit';
import * as N from '@radix-ui/react-navigation-menu';
import { NavLink } from 'react-router-dom';

import { Links, Routes } from '../../pages/client-router';
import {
  ProtocolUpgradeCountdown,
  ProtocolUpgradeCountdownMode,
} from '@vegaprotocol/proposals';
import classNames from 'classnames';
import { ViewType, useSidebar } from '../sidebar';
import { VegaWalletMenu } from '../vega-wallet';

export const Navbar = () => {
  const [menu, setMenu] = useState<'wallet' | 'nav' | null>(null);
  const { view, setView } = useSidebar();

  return (
    <N.Root>
      <div className="flex items-center gap-2 h-10 pl-3 lg:pl-5 pr-1 border-b border-default bg-vega-clight-800 dark:bg-vega-cdark-800">
        <div className="pr-2">
          <VLogo className="w-5" />
        </div>
        <div className="hidden lg:block">
          <NavbarMenu />
        </div>
        <div className="ml-auto flex justify-end items-center gap-2">
          <button
            className="lg:hidden"
            onClick={() => setMenu((x) => (x === 'wallet' ? null : 'wallet'))}
          >
            Wallet
          </button>
          <button
            className="lg:hidden"
            onClick={() => setMenu((x) => (x === 'nav' ? null : 'nav'))}
          >
            Menu
          </button>
          <div className="hidden lg:block">
            <VegaWalletConnectButton />
          </div>
          <button
            className={classNames('flex items-center p-2 rounded', {
              'text-vega-clight-200 dark:text-vega-cdark-200 hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500':
                view?.type !== ViewType.Settings,
              'bg-vega-yellow hover:bg-vega-yellow-550 text-black':
                view?.type === ViewType.Settings,
            })}
            onClick={() => {
              if (view?.type === ViewType.Settings) {
                setView(null);
              } else {
                setView({ type: ViewType.Settings });
              }
            }}
          >
            <VegaIcon name={VegaIconNames.COG} size={20} />
          </button>
        </div>
      </div>
      {menu !== null && (
        <div className="fixed top-0 right-0 z-20 w-3/4 h-screen border-l border-default bg-vega-clight-700 dark:bg-vega-cdark-700">
          <div className="flex justify-end items-center h-10 px-3">
            <button onClick={() => setMenu(null)}>Close</button>
          </div>
          {menu === 'nav' && <NavbarMenu />}
          {menu === 'wallet' && <VegaWalletMenu setMenu={setMenu} />}
        </div>
      )}
    </N.Root>
  );
};

const NavbarMenu = () => {
  const { GITHUB_FEEDBACK_URL } = useEnvironment();
  const marketId = useGlobalStore((store) => store.marketId);
  const tokenLink = useLinks(DApp.Token);
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();
  return (
    <N.List className="lg:flex gap-4">
      <N.Item>
        <NavbarLink to={Links[Routes.MARKETS]()}>{t('Markets')}</NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarLink to={tradingPath}>{t('Trading')}</NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarLink to={tokenLink(TOKEN_GOVERNANCE)}>
          {t('Governance')}
        </NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarTrigger>{t('Resources')}</NavbarTrigger>
        <NavbarContent>
          <ul className="lg:p-4">
            {DocsLinks?.NEW_TO_VEGA && (
              <li>
                <NavbarLink to={DocsLinks?.NEW_TO_VEGA}>{t('Docs')}</NavbarLink>
              </li>
            )}
            {GITHUB_FEEDBACK_URL && (
              <li>
                <NavbarLink to={GITHUB_FEEDBACK_URL}>
                  {t('Give Feedback')}
                </NavbarLink>
              </li>
            )}
            <li>
              <NavbarLink to={Links[Routes.DISCLAIMER]()}>
                {t('Disclaimer')}
              </NavbarLink>
            </li>
          </ul>
        </NavbarContent>
      </N.Item>
    </N.List>
  );
};

const NavbarTrigger = ({ children }: { children: ReactNode }) => {
  return (
    <N.Trigger
      onPointerMove={preventHover}
      onPointerLeave={preventHover}
      className="flex items-center gap-2 py-2 px-6 lg:px-2 text-lg lg:text-base"
    >
      {children}
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
    </N.Trigger>
  );
};

const NavbarLink = ({ children, to }: { children: ReactNode; to: string }) => {
  return (
    <N.Link asChild={true}>
      <NavLink
        to={to}
        className="relative block py-2 px-6 lg:px-0 text-lg lg:text-base"
      >
        {({ isActive }) => {
          const borderClasses = {
            'border-b-2': true,
            'border-transparent': !isActive,
            'border-vega-yellow': isActive,
          };
          return (
            <>
              <span className={classNames('lg:border-0', borderClasses)}>
                {children}
              </span>
              <span
                className={classNames(
                  'hidden lg:block absolute left-0 bottom-0 w-full h-0',
                  borderClasses
                )}
              />
            </>
          );
        }}
      </NavLink>
    </N.Link>
  );
};

const NavbarContent = ({ children }: { children: ReactNode }) => {
  return (
    <N.Content
      className={classNames(
        'lg:absolute lg:mt-4 pl-6 lg:pl-0 z-20 lg:min-w-[290px]',
        'lg:bg-vega-clight-800 lg:dark:bg-vega-cdark-800',
        'lg:border border-default lg:rounded'
      )}
      onPointerEnter={preventHover}
      onPointerLeave={preventHover}
    >
      {children}
    </N.Content>
  );
};

// https://github.com/radix-ui/primitives/issues/1630
const preventHover = (e: any) => {
  e.preventDefault();
};

export const Navbar2 = ({
  theme = 'system',
}: {
  theme: ComponentProps<typeof Navigation>['theme'];
}) => {
  const { GITHUB_FEEDBACK_URL } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const marketId = useGlobalStore((store) => store.marketId);

  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();

  // return (
  //   <nav className="flex items-center gap-4 py-2">
  //     <div>Network switcher</div>
  //     <NavLink to={Links[Routes.MARKETS]()}>Markets</NavLink>
  //     <NavLink to={tradingPath} end>
  //       Trading
  //     </NavLink>
  //     <NavLink to={Links[Routes.PORTFOLIO]()}>Portfolio</NavLink>
  //   </nav>
  // );

  return (
    <Navigation
      appName="console"
      theme={theme}
      actions={
        <>
          <ProtocolUpgradeCountdown
            mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
          />
          <VegaWalletConnectButton />
        </>
      }
      breakpoints={[521, 1122]}
    >
      <NavigationList
        className="[.drawer-content_&]:border-b [.drawer-content_&]:border-b-vega-light-200 dark:[.drawer-content_&]:border-b-vega-dark-200 [.drawer-content_&]:pb-8 [.drawer-content_&]:mb-2"
        hide={[NavigationBreakpoint.Small]}
      >
        <NavigationItem className="[.drawer-content_&]:w-full">
          <NetworkSwitcher className="[.drawer-content_&]:w-full" />
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        <NavigationItem>
          <NavigationLink data-testid="Markets" to={Links[Routes.MARKETS]()}>
            {t('Markets')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink data-testid="Trading" to={tradingPath} end>
            {t('Trading')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink
            data-testid="Portfolio"
            to={Links[Routes.PORTFOLIO]()}
          >
            {t('Portfolio')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavExternalLink href={tokenLink(TOKEN_GOVERNANCE)}>
            {t('Governance')}
          </NavExternalLink>
        </NavigationItem>
        {DocsLinks?.NEW_TO_VEGA && GITHUB_FEEDBACK_URL && (
          <NavigationItem>
            <NavigationTrigger>{t('Resources')}</NavigationTrigger>
            <NavigationContent>
              <NavigationList>
                <NavigationItem>
                  <NavExternalLink href={DocsLinks.NEW_TO_VEGA}>
                    {t('Docs')}
                  </NavExternalLink>
                </NavigationItem>
                <NavigationItem>
                  <NavExternalLink href={GITHUB_FEEDBACK_URL}>
                    {t('Give Feedback')}
                  </NavExternalLink>
                </NavigationItem>
                <NavigationItem>
                  <NavigationLink
                    data-testid="Disclaimer"
                    to={Links[Routes.DISCLAIMER]()}
                  >
                    {t('Disclaimer')}
                  </NavigationLink>
                </NavigationItem>
              </NavigationList>
            </NavigationContent>
          </NavigationItem>
        )}
      </NavigationList>
    </Navigation>
  );
};

const NavExternalLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => {
  return (
    <ExternalLink href={href}>
      <span className="flex items-center gap-2">
        <span>{children}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
      </span>
    </ExternalLink>
  );
};
