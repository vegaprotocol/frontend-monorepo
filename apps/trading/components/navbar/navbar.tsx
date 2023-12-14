import type { ButtonHTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import {
  useEnvironment,
  DocsLinks,
  Networks,
  DApp,
  useLinks,
  useFeatureFlags,
  useEnvNameMapping,
} from '@vegaprotocol/environment';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  VegaIconNames,
  VegaIcon,
  VLogo,
  LanguageSelector,
  ThemeSwitcher,
} from '@vegaprotocol/ui-toolkit';
import * as N from '@radix-ui/react-navigation-menu';
import * as D from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';

import { Links } from '../../lib/links';
import classNames from 'classnames';
import { VegaWalletMenu } from '../vega-wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { WalletIcon } from '../icons/wallet';
import { ProtocolUpgradeCountdown } from '@vegaprotocol/proposals';
import { useT, useI18n } from '../../lib/use-t';
import { supportedLngs } from '../../lib/i18n';

type MenuState = 'wallet' | 'nav' | null;
type Theme = 'system' | 'yellow';

export const Navbar = ({
  children,
  theme = 'system',
}: {
  children?: ReactNode;
  theme?: Theme;
}) => {
  const i18n = useI18n();
  const t = useT();
  // menu state for small screens
  const [menu, setMenu] = useState<MenuState>(null);

  const { pubKey } = useVegaWallet();

  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const isConnected = pubKey !== null;

  const navTextClasses = 'text-vega-clight-200 dark:text-vega-cdark-200';
  const rootClasses = classNames(
    navTextClasses,
    'flex gap-3 h-10 pr-1',
    'border-b border-default',
    'bg-vega-clight-800 dark:bg-vega-cdark-800'
  );
  return (
    <N.Root className={rootClasses}>
      <NavLink
        to="/"
        className={classNames('flex items-center px-3', {
          'bg-vega-yellow text-vega-clight-50': theme === 'yellow',
          'text-default': theme === 'system',
        })}
        style={{
          background: theme === 'yellow' ? 'url(/testnet-logo-bg.png' : 'none',
        }}
      >
        <VLogo className="w-4" />
      </NavLink>
      {/* Left section */}
      <div className="flex items-center lg:hidden">{children}</div>
      {/* Used to show header in nav on mobile */}
      <div className="hidden lg:block">
        <NavbarMenu onClick={() => setMenu(null)} />
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center justify-end gap-2">
        <ProtocolUpgradeCountdown />
        <div className="flex">
          <ThemeSwitcher />
          {supportedLngs.length > 1 ? (
            <LanguageSelector
              languages={supportedLngs}
              onSelect={(language) => i18n.changeLanguage(language)}
            />
          ) : null}
        </div>
        <NavbarMobileButton
          onClick={() => {
            if (isConnected) {
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
            className="fixed inset-0 z-20 bg-black/50 dark:bg-black/80 lg:hidden"
            data-testid="navbar-menu-overlay"
          />
          <D.Content
            className={classNames(
              'lg:hidden',
              'border-default bg-vega-clight-700 dark:bg-vega-cdark-700 fixed right-0 top-0 z-20 h-screen w-3/4 border-l',
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
  const featureFlags = useFeatureFlags((state) => state.flags);
  const t = useT();
  const envNameMapping = useEnvNameMapping();
  const { VEGA_ENV, VEGA_NETWORKS, GITHUB_FEEDBACK_URL } = useEnvironment();
  const marketId = useGlobalStore((store) => store.marketId);

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
          </NavbarLink>
        </NavbarItem>
        {featureFlags.REFERRALS && (
          <NavbarItem>
            <NavbarLink end={false} to={Links.REFERRALS()} onClick={onClick}>
              {t('Referrals')}
            </NavbarLink>
          </NavbarItem>
        )}
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
          <NavbarLinkExternal to={useLinks(DApp.Governance)()}>
            {t('Governance')}
          </NavbarLinkExternal>
        </NavbarItem>
        <NavbarItem>
          <NavbarTrigger>{t('Resources')}</NavbarTrigger>
          <NavbarContent data-testid="navbar-content-resources">
            <ul className="lg:p-4">
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
      className={classNames(
        'w-full lg:h-full lg:w-auto',
        'flex items-center justify-between gap-2 px-6 py-2 lg:justify-center lg:p-0',
        'text-lg lg:text-sm',
        'hover:text-vega-clight-100 dark:hover:text-vega-cdark-100'
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
        className={classNames(
          'block flex-col justify-center lg:flex lg:h-full',
          'px-6 py-2 text-lg lg:p-0 lg:text-sm',
          'hover:text-vega-clight-100 dark:hover:text-vega-cdark-100'
        )}
        onClick={onClick}
      >
        {({ isActive }) => {
          const borderClasses = {
            'border-b-2': true,
            'border-transparent': !isActive,
            'border-vega-yellow lg:group-[.navbar-content]:border-transparent':
              isActive,
          };
          return (
            <>
              <span
                className={classNames('lg:border-0', borderClasses, {
                  'text-vega-clight-50 dark:text-vega-cdark-50': isActive,
                })}
              >
                {children}
              </span>
              <span
                className={classNames(
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
      className={classNames(
        'navbar-content group',
        'z-20 pl-2 lg:absolute lg:mt-2 lg:min-w-[290px] lg:pl-0',
        'lg:bg-vega-clight-700 lg:dark:bg-vega-cdark-700',
        'border-vega-clight-500 dark:border-vega-cdark-500 lg:rounded lg:border'
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
        className={classNames(
          'flex items-center gap-2 lg:h-full',
          'px-6 py-2 text-lg lg:p-0 lg:text-sm',
          'hover:text-vega-clight-100 dark:hover:text-vega-cdark-100'
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
      <div className="bg-vega-clight-500 dark:bg-vega-cdark-500 h-px w-full lg:h-full lg:w-px" />
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
      className={classNames(
        'flex h-8 w-8 items-center rounded p-1 lg:hidden ',
        'hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500',
        'hover:text-vega-clight-50 dark:hover:text-vega-cdark-50'
      )}
    />
  );
};

// https://github.com/radix-ui/primitives/issues/1630
// eslint-disable-next-line
const preventHover = (e: any) => {
  e.preventDefault();
};
