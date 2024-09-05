import type { ButtonHTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import {
  DocsLinks,
  DApp,
  useLinks,
  useFeatureFlags,
} from '@vegaprotocol/environment';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  VegaIconNames,
  VegaIcon,
  LanguageSelector,
  ThemeSwitcher,
  Icon,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import * as N from '@radix-ui/react-navigation-menu';
import * as D from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';

import { Links } from '../../lib/links';
import { cn } from '@vegaprotocol/ui-toolkit';
import { VegaWalletMenu } from '../vega-wallet';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { WalletIcon } from '../icons/wallet';
import { ProtocolUpgradeCountdown } from '@vegaprotocol/proposals';
import { useT, useI18n } from '../../lib/use-t';
import { supportedLngs } from '../../lib/i18n';
import { SettingsPopover } from '../settings';
import { NodeHealthContainer } from '../node-health';
import { WithdrawalsIndicator } from '../withdrawals-indicator';
import React from 'react';
import { InBrowserWalletButton } from '../browser-wallet-button';
import { BrowserWallet } from '../browser-wallet';

type MenuState = 'wallet' | 'nav' | 'browser-wallet' | null;

export const Navbar = () => {
  const i18n = useI18n();
  const t = useT();
  // menu state for small screens
  const [menu, setMenu] = useState<MenuState>(null);
  const { IN_BROWSER_WALLET } = useFeatureFlags((state) => state.flags);
  const { theme } = useThemeSwitcher();

  const status = useWallet((store) => store.status);

  const openVegaWalletDialog = useDialogStore((store) => store.open);

  return (
    <N.Root className="flex justify-between gap-3 h-10 pr-1 text-surface-1-fg">
      {/* Left section */}
      <div className="grow basis-0 flex justify-start items-center">
        <NavLink
          to="/"
          className={cn(
            'flex items-center px-3',
            'bg-[image:var(--nav-logo-bg-img-dark)] dark:bg-[image:var(--nav-logo-bg-img-dark)]',
            'bg-[color:var(--nav-logo-bg-light)] dark:bg-[color:var(--nav-logo-bg-dark)]'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Logo"
            src={theme === 'dark' ? './logo-dark.svg' : './logo-light.svg'}
            className="block w-4"
          />
        </NavLink>
      </div>

      {/* Middle section */}
      <div className="hidden lg:block">
        <NavbarMenu onClick={() => setMenu(null)} />
      </div>

      {/* Right section */}
      <div className="grow basis-0 flex items-center justify-end gap-2">
        <ProtocolUpgradeCountdown />
        <div className="flex items-center">
          <ThemeSwitcher />
          <SettingsPopover />
          {IN_BROWSER_WALLET && (
            <div className="hidden lg:block">
              <InBrowserWalletButton />
            </div>
          )}
          {supportedLngs.length > 1 ? (
            <LanguageSelector
              languages={supportedLngs}
              onSelect={(language) => i18n.changeLanguage(language)}
            />
          ) : null}
        </div>
        {IN_BROWSER_WALLET && (
          <NavbarMobileButton
            onClick={() => {
              setMenu((x) =>
                x === 'browser-wallet' ? null : 'browser-wallet'
              );
            }}
            data-testid="navbar-mobile-browser-wallet"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Icon name="lab-test" />
            </div>
          </NavbarMobileButton>
        )}
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
          <VegaWalletConnectButton intent={Intent.Primary} />
        </div>
      </div>
      {menu !== null && (
        <D.Root
          open={menu !== null}
          onOpenChange={(open) => setMenu((x) => (open ? x : null))}
        >
          <D.Overlay
            className="fixed inset-0 z-20 bg-surface-2/50 lg:hidden"
            data-testid="navbar-menu-overlay"
          />
          <D.Content
            className={cn(
              'lg:hidden',
              'border-gs-300 dark:border-gs-700 bg-surface-1 text-surface-1-fg-muted fixed right-0 top-0 z-20 h-full w-3/4 border-l flex flex-col'
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
            {menu === 'browser-wallet' && <BrowserWallet />}
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
  const flags = useFeatureFlags((state) => state.flags);
  const marketId = useGlobalStore((store) => store.marketId);
  const GOVERNANCE_LINK = useLinks(DApp.Governance)();
  const EXPLORER_LINK = useLinks(DApp.Explorer)();

  return (
    <div className="gap-3 lg:flex lg:h-full">
      <NavbarList>
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
        {flags.ENABLE_AMM && (
          <NavbarItem>
            <NavbarLink to={Links.AMM_POOLS()} onClick={onClick}>
              {t('AMM_NAV_ROOT')}
            </NavbarLink>
          </NavbarItem>
        )}
        <NavbarItem>
          <NavbarLink to={Links.COMPETITIONS()} onClick={onClick}>
            {t('Competitions')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarTrigger>{t('More')}</NavbarTrigger>
          <NavbarContent data-testid="navbar-content-more">
            <ul className="flex flex-col gap-0 lg:gap-4 p-4">
              <NavbarSubItem>
                <NavbarLink to={Links.MARKETS()}>{t('Markets')}</NavbarLink>
              </NavbarSubItem>
              <NavbarSubItem>
                <NavbarLink to={Links.FEES()}>{t('Fees')}</NavbarLink>
              </NavbarSubItem>
              <NavbarSubItem>
                <NavbarLink to={Links.REWARDS()}>{t('Rewards')}</NavbarLink>
              </NavbarSubItem>
              <NavbarSubItem>
                <NavbarLink to={Links.REFERRALS()}>{t('Referrals')}</NavbarLink>
              </NavbarSubItem>
              <NavbarSubItem>
                <NavbarLinkExternal to={GOVERNANCE_LINK}>
                  {t('Governance')}
                </NavbarLinkExternal>
              </NavbarSubItem>
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
        'hover:text-surface-1-fg'
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
          'hover:text-surface-1-fg'
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
                    'text-surface-1-fg ': isActive,
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
  return <li {...props} />;
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
        'z-20 lg:absolute lg:mt-2 lg:min-w-[290px]',
        'bg-surface-1 lg:border lg:rounded'
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
          'hover:text-surface-1-fg'
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

/**
 * Button component to avoid repeating styles for buttons shown on small screens
 */
const NavbarMobileButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={cn(
        'flex h-8 w-8 items-center rounded p-1 lg:hidden',
        'hover:text-surface-1-fg'
      )}
    />
  );
};

// https://github.com/radix-ui/primitives/issues/1630
// eslint-disable-next-line
const preventHover = (e: any) => {
  e.preventDefault();
};
