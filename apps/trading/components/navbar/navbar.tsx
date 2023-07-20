import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useEnvironment,
  useLinks,
  DocsLinks,
  Networks,
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
import * as D from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';

import { Links, Routes } from '../../pages/client-router';
import {
  ProtocolUpgradeCountdown,
  ProtocolUpgradeCountdownMode,
} from '@vegaprotocol/proposals';
import classNames from 'classnames';
import { VegaWalletMenu } from '../vega-wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { WalletIcon } from '../icons/wallet';

type MenuState = 'wallet' | 'nav' | null;

export const Navbar = ({ children }: { children?: ReactNode }) => {
  const [menu, setMenu] = useState<MenuState>(null);
  const { pubKey } = useVegaWallet();
  const isConnected = pubKey !== null;
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  return (
    <N.Root className="text-vega-clight-200 dark:text-vega-cdark-200 ">
      <div className="flex items-center gap-2 h-10 px-3 lg:pl-5 pr-2 border-b border-default bg-vega-clight-800 dark:bg-vega-cdark-800">
        <div className="pr-2">
          <VLogo className="w-4 text-default" />
        </div>
        <div className="lg:hidden">{children}</div>
        <div className="hidden lg:block">
          <NavbarMenu onClick={() => setMenu(null)} />
        </div>
        <div className="ml-auto flex justify-end items-center gap-2">
          <button
            className="lg:hidden flex items-center p-1 rounded hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500"
            onClick={() => {
              if (isConnected) {
                setMenu((x) => (x === 'wallet' ? null : 'wallet'));
              } else {
                openVegaWalletDialog();
              }
            }}
          >
            <WalletIcon />
          </button>
          <button
            className="lg:hidden flex itesm-center p-1 rounded hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500"
            onClick={() => {
              setMenu((x) => (x === 'nav' ? null : 'nav'));
            }}
          >
            <BurgerIcon />
          </button>
          <div className="hidden lg:block">
            <VegaWalletConnectButton />
          </div>
        </div>
      </div>
      {menu !== null && (
        <D.Root
          open={menu !== null}
          onOpenChange={(open) => setMenu((x) => (open ? x : null))}
        >
          <D.Overlay
            className="fixed inset-0 dark:bg-black/80 bg-black/50 z-20"
            data-testid="dialog-overlay"
          />
          <D.Content className="fixed top-0 right-0 z-20 w-3/4 h-screen border-l border-default bg-vega-clight-700 dark:bg-vega-cdark-700">
            <div className="flex justify-end items-center h-10 p-1">
              <button
                onClick={() => setMenu(null)}
                className="flex flex-col justify-center p-2 hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500 rounded"
              >
                <VegaIcon name={VegaIconNames.CROSS} size={24} />
              </button>
            </div>
            {menu === 'nav' && <NavbarMenu onClick={() => setMenu(null)} />}
            {menu === 'wallet' && <VegaWalletMenu setMenu={setMenu} />}
          </D.Content>
        </D.Root>
      )}
    </N.Root>
  );
};

const NavbarMenu = ({ onClick }: { onClick: () => void }) => {
  const { VEGA_ENV, VEGA_NETWORKS, GITHUB_FEEDBACK_URL } = useEnvironment();
  const marketId = useGlobalStore((store) => store.marketId);
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();

  return (
    <N.List className="lg:flex gap-4">
      <N.Item>
        <NavbarTrigger>
          {envNameMapping[VEGA_ENV]}
          <NavbarDivider />
        </NavbarTrigger>
        <NavbarContent>
          <ul className="lg:px-4 lg:py-2">
            {[Networks.MAINNET, Networks.TESTNET].map((n) => {
              const url = VEGA_NETWORKS[n];
              if (!url) return;
              return (
                <li key={n}>
                  <NavbarLink to={url}>{envNameMapping[n]}</NavbarLink>
                </li>
              );
            })}
          </ul>
        </NavbarContent>
      </N.Item>
      <NavbarDivider />
      <N.Item>
        <NavbarLink to={Links[Routes.MARKETS]()} onClick={onClick}>
          {t('Markets')}
        </NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarLink to={tradingPath} onClick={onClick}>
          {t('Trading')}
        </NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarLink to={Links[Routes.PORTFOLIO]()} onClick={onClick}>
          {t('Portfolio')}
        </NavbarLink>
      </N.Item>
      <N.Item>
        <NavbarTrigger>{t('Resources')}</NavbarTrigger>
        <NavbarContent>
          <ul className="lg:px-4 lg:py-2">
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
              <NavbarLink to={Links[Routes.DISCLAIMER]()} onClick={onClick}>
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
      className={classNames(
        'relative flex items-center gap-2 py-2 px-6 lg:px-0',
        'text-lg lg:text-base hover:text-vega-clight-50 dark:hover:text-vega-cdark-50'
      )}
    >
      {children}
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
    </N.Trigger>
  );
};

const NavbarLink = ({
  children,
  to,
  onClick,
}: {
  children: ReactNode;
  to: string;
  onClick?: () => void;
}) => {
  return (
    <N.Link asChild={true}>
      <NavLink
        to={to}
        className="relative block lg:inline-block py-2 px-6 lg:px-0 text-lg lg:text-base"
        onClick={onClick}
      >
        {({ isActive }) => {
          const borderClasses = {
            'border-b-2': true,
            'border-transparent': !isActive,
            'border-vega-yellow': isActive,
          };
          return (
            <>
              <span
                className={classNames(
                  'hover:text-vega-clight-50 dark:hover:text-vega-cdark-50 lg:border-0',
                  borderClasses,
                  {
                    'text-vega-clight-50 dark:text-vega-cdark-50': isActive,
                  }
                )}
              >
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
        'lg:absolute lg:mt-2 pl-2 lg:pl-0 z-20 lg:min-w-[290px]',
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

const BurgerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" className="stroke-current">
    <line x1={0.5} x2={15.5} y1={3.5} y2={3.5} />
    <line x1={0.5} x2={15.5} y1={11.5} y2={11.5} />
  </svg>
);

const NavbarDivider = () => {
  return (
    <li className="lg:py-2" role="separator">
      <div className="h-px lg:h-full w-full lg:w-px bg-vega-clight-600 dark:bg-vega-cdark-600" />
    </li>
  );
};

const envNameMapping: Record<Networks, string> = {
  [Networks.VALIDATOR_TESTNET]: t('VALIDATOR_TESTNET'),
  [Networks.CUSTOM]: t('Custom'),
  [Networks.DEVNET]: t('Devnet'),
  [Networks.STAGNET1]: t('Stagnet'),
  [Networks.TESTNET]: t('Fairground testnet'),
  [Networks.MAINNET]: t('Mainnet'),
};
