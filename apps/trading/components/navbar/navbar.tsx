import type { ButtonHTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import {
  useEnvironment,
  DocsLinks,
  Networks,
  DApp,
  useLinks,
  useEnvNameMapping,
} from '@vegaprotocol/environment';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  VegaIconNames,
  VegaIcon,
  LanguageSelector,
  ThemeSwitcher,
} from '@vegaprotocol/ui-toolkit';
import * as N from '@radix-ui/react-navigation-menu';
import * as D from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';

import { Links } from '../../lib/links';
import { cn } from '@vegaprotocol/utils';
import { VegaWalletMenu } from '../vega-wallet';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { WalletIcon } from '../icons/wallet';
import { ProtocolUpgradeCountdown } from '@vegaprotocol/proposals';
import { useT, useI18n } from '../../lib/use-t';
import { supportedLngs } from '../../lib/i18n';
import { SettingsPopover } from '../settings';
import { NodeHealthContainer } from '../node-health';
import { WithdrawalsIndicator } from '../withdrawals-indicator';

type MenuState = 'wallet' | 'nav' | null;

export const Navbar = () => {
  const i18n = useI18n();
  const t = useT();
  // menu state for small screens
  const [menu, setMenu] = useState<MenuState>(null);

  const status = useWallet((store) => store.status);

  const openVegaWalletDialog = useDialogStore((store) => store.open);

  const navTextClasses = 'text-gs-200 ';
  const rootClasses = cn(
    navTextClasses,
    'flex gap-3 h-10 pr-1',
    'border-b border-default',
    'bg-gs-800 '
  );
  return (
    <N.Root className={rootClasses}>
      <NavLink
        to="/"
        className={cn(
          'flex items-center px-3',
          'bg-[image:var(--nav-logo-bg)]',
          'bg-[color:var(--nav-accent-color)]'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Logo" src="/logo.svg" className="block w-4" />
      </NavLink>
      {/* Used to show header in nav on mobile */}
      <div className="hidden lg:block">
        <NavbarMenu onClick={() => setMenu(null)} />
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center justify-end gap-2">
        <ProtocolUpgradeCountdown />
        <div className="flex items-center">
          <ThemeSwitcher />
          <SettingsPopover />
          {supportedLngs.length > 1 ? (
            <LanguageSelector
              languages={supportedLngs}
              onSelect={(language) => i18n.changeLanguage(language)}
            />
          ) : null}
        </div>
        <NavbarMobileButton
          onClick={() => {
            if (status === 'connected') {
              setMenu((x) => (x === 'wallet' ? null : 'wallet'));
            } else {
              openVegaWalletDialog();
            }
          }}
          data-testid="navbar-mobile-wallet"
        >
          <span className="sr-only">{t('Wallet')}</span>
          <WalletIcon className="w-6" />
        </NavbarMobileButton>
        <NavbarMobileButton
          onClick={() => {
            setMenu((x) => (x === 'nav' ? null : 'nav'));
          }}
          data-testid="navbar-mobile-burger"
        >
          <span className="sr-only">{t('Menu')}</span>
          <BurgerIcon />
        </NavbarMobileButton>
        <div className="hidden lg:block">
          <VegaWalletConnectButton />
        </div>
      </div>
      {menu !== null && (
        <D.Root
          open={menu !== null}
          onOpenChange={(open) => setMenu((x) => (open ? x : null))}
        >
          <D.Overlay
            className="fixed inset-0 z-20 bg-gs-900/50 lg:hidden"
            data-testid="navbar-menu-overlay"
          />
          <D.Content
            className={cn(
              'lg:hidden',
              'border-default bg-gs-700  fixed right-0 top-0 z-20 h-full w-3/4 border-l flex flex-col',
              navTextClasses
            )}
            data-testid="navbar-menu-content"
          >
            <div className="flex h-10 items-center justify-end p-1">
              <NavbarMobileButton onClick={() => setMenu(null)}>
                <span className="sr-only">{t('Close menu')}</span>
                <VegaIcon name={VegaIconNames.CROSS} size={24} />
              </NavbarMobileButton>
            </div>
            {menu === 'nav' && <NavbarMenu onClick={() => setMenu(null)} />}
            {menu === 'wallet' && <VegaWalletMenu setMenu={setMenu} />}
            <div className="p-2 mt-auto flex justify-end">
              <NodeHealthContainer variant="normal" />
            </div>
          </D.Content>
        </D.Root>
      )}
    </N.Root>
  );
};

/**
 * List of links or dropdown triggers to show in the main section
 * of the navigation
 */
const NavbarMenu = ({ onClick }: { onClick: () => void }) => {
  const t = useT();
  const envNameMapping = useEnvNameMapping();
  const { VEGA_ENV, VEGA_NETWORKS, GITHUB_FEEDBACK_URL } = useEnvironment();
  const marketId = useGlobalStore((store) => store.marketId);
  const GOVERNANCE_LINK = useLinks(DApp.Governance)();
  const EXPLORER_LINK = useLinks(DApp.Explorer)();

  return (
    <div className="gap-3 lg:flex lg:h-full">
      <NavbarList>
        <NavbarItem>
          <NavbarTrigger data-testid="navbar-network-switcher-trigger">
            {envNameMapping[VEGA_ENV]}
          </NavbarTrigger>
          <NavbarContent data-testid="navbar-content-network-switcher">
            <ul className="lg:p-4">
              {[Networks.MAINNET, Networks.TESTNET].map((n) => {
                const url = VEGA_NETWORKS[n];
                if (!url) return;
                return (
                  <NavbarSubItem key={n}>
                    <NavbarLink to={url}>{envNameMapping[n]}</NavbarLink>
                  </NavbarSubItem>
                );
              })}
            </ul>
          </NavbarContent>
        </NavbarItem>
      </NavbarList>
      <NavbarListDivider />
      <NavbarList>
        <NavbarItem>
          <NavbarLink to={Links.MARKETS()} onClick={onClick}>
            {t('Markets')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links.MARKET(marketId || '')} onClick={onClick}>
            {t('Trading')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links.PORTFOLIO()} onClick={onClick}>
            {t('Portfolio')}
            <WithdrawalsIndicator />
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links.COMPETITIONS()} onClick={onClick}>
            {t('Competitions')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink end={false} to={Links.REFERRALS()} onClick={onClick}>
            {t('Referrals')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links.FEES()} onClick={onClick}>
            {t('Fees')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links.REWARDS()} onClick={onClick}>
            {t('Rewards')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLinkExternal to={GOVERNANCE_LINK}>
            {t('Governance')}
          </NavbarLinkExternal>
        </NavbarItem>
        <NavbarItem>
          <NavbarTrigger>{t('Resources')}</NavbarTrigger>
          <NavbarContent data-testid="navbar-content-resources">
            <ul className="lg:p-4">
              {EXPLORER_LINK && (
                <NavbarSubItem>
                  <NavbarLinkExternal to={EXPLORER_LINK}>
                    {t('Explorer')}
                  </NavbarLinkExternal>
                </NavbarSubItem>
              )}
              {DocsLinks?.NEW_TO_VEGA && (
                <NavbarSubItem>
                  <NavbarLinkExternal to={DocsLinks?.NEW_TO_VEGA}>
                    {t('Docs')}
                  </NavbarLinkExternal>
                </NavbarSubItem>
              )}
              {GITHUB_FEEDBACK_URL && (
                <NavbarSubItem>
                  <NavbarLinkExternal to={GITHUB_FEEDBACK_URL}>
                    {t('Give Feedback')}
                  </NavbarLinkExternal>
                </NavbarSubItem>
              )}
              <NavbarSubItem>
                <NavbarLink to={Links.DISCLAIMER()} onClick={onClick}>
                  {t('Disclaimer')}
                </NavbarLink>
              </NavbarSubItem>
            </ul>
          </NavbarContent>
        </NavbarItem>
      </NavbarList>
    </div>
  );
};

/**
 * Wrapper for radix-ux Trigger for consistent styles
 */
const NavbarTrigger = ({
  children,
  ...props
}: N.NavigationMenuTriggerProps) => {
  return (
    <N.Trigger
      {...props}
      onPointerMove={preventHover}
      onPointerLeave={preventHover}
      className={cn(
        'w-full lg:h-full lg:w-auto',
        'flex items-center justify-between gap-2 px-6 py-2 lg:justify-center lg:p-0',
        'text-lg lg:text-sm',
        'hover:text-gs-100 '
      )}
    >
      {children}
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
    </N.Trigger>
  );
};

/**
 * Wrapper for react-router-dom NavLink for consistent styles
 */
const NavbarLink = ({
  children,
  to,
  onClick,
  end = true,
}: {
  children: ReactNode;
  to: string;
  onClick?: () => void;
  end?: boolean;
}) => {
  return (
    <N.Link asChild={true}>
      <NavLink
        to={to}
        end={end}
        className={cn(
          'block flex-col justify-center lg:flex lg:h-full',
          'px-6 py-2 text-lg lg:p-0 lg:text-sm',
          'hover:text-gs-100 '
        )}
        onClick={onClick}
      >
        {({ isActive }) => {
          const borderClasses = {
            'border-b-2': true,
            'border-transparent': !isActive,
            'border-[color:var(--nav-accent-color)] lg:group-[.navbar-content]:border-transparent':
              isActive,
          };
          return (
            <>
              <span
                className={cn(
                  'inline-flex gap-1 items-center lg:border-0',
                  borderClasses,
                  {
                    'text-gs-50 ': isActive,
                  }
                )}
              >
                {children}
              </span>
              <span
                className={cn(
                  'absolute bottom-0 left-0 hidden h-0 w-full lg:block',
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

const NavbarItem = (props: N.NavigationMenuItemProps) => {
  return <N.Item {...props} className="relative" />;
};

const NavbarSubItem = (props: LiHTMLAttributes<HTMLElement>) => {
  return <li {...props} className="lg:mb-4 lg:last:mb-0" />;
};

const NavbarList = (props: N.NavigationMenuListProps) => {
  return <N.List {...props} className="gap-6 lg:flex lg:h-full" />;
};

/**
 * Content that gets rendered when a sub section of the navbar is shown
 */
const NavbarContent = (props: N.NavigationMenuContentProps) => {
  return (
    <N.Content
      {...props}
      className={cn(
        'navbar-content group',
        'z-20 pl-2 lg:absolute lg:mt-2 lg:min-w-[290px] lg:pl-0',
        'lg:bg-gs-700 lg:',
        'border-gs-500  lg:rounded lg:border'
      )}
      onPointerEnter={preventHover}
      onPointerLeave={preventHover}
    />
  );
};

/**
 * NavbarLink with OPEN_EXTERNAL icon
 */
const NavbarLinkExternal = ({
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
        className={cn(
          'flex items-center gap-2 lg:h-full',
          'px-6 py-2 text-lg lg:p-0 lg:text-sm',
          'hover:text-gs-100 '
        )}
        onClick={onClick}
        target="_blank"
      >
        <span>{children}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={14} />
      </NavLink>
    </N.Link>
  );
};

const BurgerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 16 16"
    className="w-full stroke-current"
  >
    <line x1={0.5} x2={15.5} y1={3.5} y2={3.5} />
    <line x1={0.5} x2={15.5} y1={11.5} y2={11.5} />
  </svg>
);

const NavbarListDivider = () => {
  return (
    <div className="px-6 py-2 lg:px-0" role="separator">
      <div className="bg-gs-500  h-px w-full lg:h-full lg:w-px" />
    </div>
  );
};

/**
 * Button component to avoid repeating styles for buttons shown on small screens
 */
const NavbarMobileButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={cn(
        'flex h-8 w-8 items-center rounded p-1 lg:hidden ',
        'hover:bg-gs-500 ',
        'hover:text-gs-50 '
      )}
    />
  );
};

// https://github.com/radix-ui/primitives/issues/1630
// eslint-disable-next-line
const preventHover = (e: any) => {
  e.preventDefault();
};
