import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { useEnvironment, DocsLinks, Networks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { VegaIconNames, VegaIcon, VLogo } from '@vegaprotocol/ui-toolkit';
import * as N from '@radix-ui/react-navigation-menu';
import * as D from '@radix-ui/react-dialog';
import { NavLink } from 'react-router-dom';

import { Links, Routes } from '../../pages/client-router';
import classNames from 'classnames';
import { VegaWalletMenu } from '../vega-wallet';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { WalletIcon } from '../icons/wallet';

type MenuState = 'wallet' | 'nav' | null;

export const Navbar = ({ children }: { children?: ReactNode }) => {
  // menu state for small screens
  const [menu, setMenu] = useState<MenuState>(null);

  const { pubKey } = useVegaWallet();

  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const isConnected = pubKey !== null;

  const navTextClasses = 'text-vega-clight-100 dark:text-vega-cdark-100';
  const rootClasses = classNames(
    navTextClasses,
    'flex items-center gap-2 h-10 px-1',
    'border-b border-default',
    'bg-vega-clight-800 dark:bg-vega-cdark-800'
  );
  return (
    <N.Root className={rootClasses}>
      <div className="lg:mr-2">
        <NavLink to="/" className="block px-2">
          <VLogo className="w-4 text-default" />
        </NavLink>
      </div>
      {/* Left section */}
      <div className="lg:hidden">{children}</div>
      {/* Used to show header in nav on mobile */}
      <div className="hidden lg:block">
        <NavbarMenu onClick={() => setMenu(null)} />
      </div>

      {/* Right section */}
      <div className="ml-auto flex justify-end items-center gap-2">
        <NavbarMobileButton
          onClick={() => {
            if (isConnected) {
              setMenu((x) => (x === 'wallet' ? null : 'wallet'));
            } else {
              openVegaWalletDialog();
            }
          }}
        >
          <WalletIcon className="w-6" />
        </NavbarMobileButton>
        <NavbarMobileButton
          onClick={() => {
            setMenu((x) => (x === 'nav' ? null : 'nav'));
          }}
        >
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
            className="lg:hidden fixed inset-0 dark:bg-black/80 bg-black/50 z-20"
            data-testid="dialog-overlay"
          />
          <D.Content
            className={classNames(
              'lg:hidden',
              'fixed top-0 right-0 z-20 w-3/4 h-screen border-l border-default bg-vega-clight-700 dark:bg-vega-cdark-700',
              navTextClasses
            )}
          >
            <div className="flex justify-end items-center h-10 p-1">
              <NavbarMobileButton onClick={() => setMenu(null)}>
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
  const { VEGA_ENV, VEGA_NETWORKS, GITHUB_FEEDBACK_URL } = useEnvironment();
  const marketId = useGlobalStore((store) => store.marketId);
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();

  return (
    <div className="lg:flex gap-3">
      <NavbarList>
        <NavbarItem>
          <NavbarTrigger>{envNameMapping[VEGA_ENV]}</NavbarTrigger>
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
        </NavbarItem>
      </NavbarList>
      <NavbarListDivider />
      <NavbarList>
        <NavbarItem>
          <NavbarLink to={Links[Routes.MARKETS]()} onClick={onClick}>
            {t('Markets')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={tradingPath} onClick={onClick}>
            {t('Trading')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink to={Links[Routes.PORTFOLIO]()} onClick={onClick}>
            {t('Portfolio')}
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarTrigger>{t('Resources')}</NavbarTrigger>
          <NavbarContent>
            <ul className="lg:px-4 lg:py-2">
              {DocsLinks?.NEW_TO_VEGA && (
                <li>
                  <NavbarLinkExternal to={DocsLinks?.NEW_TO_VEGA}>
                    {t('Docs')}
                  </NavbarLinkExternal>
                </li>
              )}
              {GITHUB_FEEDBACK_URL && (
                <li>
                  <NavbarLinkExternal to={GITHUB_FEEDBACK_URL}>
                    {t('Give Feedback')}
                  </NavbarLinkExternal>
                </li>
              )}
              <li>
                <NavbarLink to={Links[Routes.DISCLAIMER]()} onClick={onClick}>
                  {t('Disclaimer')}
                </NavbarLink>
              </li>
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
const NavbarTrigger = ({ children }: { children: ReactNode }) => {
  return (
    <N.Trigger
      onPointerMove={preventHover}
      onPointerLeave={preventHover}
      className={classNames(
        'w-full lg:w-auto',
        'relative flex items-center gap-2 py-2 px-6 lg:px-0',
        'text-lg lg:text-base hover:text-vega-clight-50 dark:hover:text-vega-cdark-50'
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

const NavbarItem = (props: N.NavigationMenuItemProps) => {
  return <N.Item {...props} />;
};

const NavbarList = (props: N.NavigationMenuListProps) => {
  return <N.List {...props} className="lg:flex gap-6" />;
};

/**
 * Content that gets rendered when a sub section of the navbar is shown
 */
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
          'flex lg:inline-flex gap-2 justify-between items-center relative',
          'py-2 px-6 lg:px-0 text-lg lg:text-base',
          'hover:text-vega-clight-50 dark:hover:text-vega-cdark-50'
        )}
        onClick={onClick}
      >
        <span>{children}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
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
    <div className="py-2 px-6 lg:px-0" role="separator">
      <div className="h-px lg:h-full w-full lg:w-px bg-vega-clight-600 dark:bg-vega-cdark-600" />
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
        'w-8 h-8 lg:hidden flex items-center p-1 rounded ',
        'hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500',
        'hover:text-vega-clight-50 dark:hover:text-vega-cdark-50'
      )}
    />
  );
};

const envNameMapping: Record<Networks, string> = {
  [Networks.VALIDATOR_TESTNET]: t('VALIDATOR_TESTNET'),
  [Networks.CUSTOM]: t('Custom'),
  [Networks.DEVNET]: t('Devnet'),
  [Networks.STAGNET1]: t('Stagnet'),
  [Networks.TESTNET]: t('Fairground testnet'),
  [Networks.MAINNET_MIRROR]: t('Mirror'),
  [Networks.MAINNET]: t('Mainnet'),
};

// https://github.com/radix-ui/primitives/issues/1630
// eslint-disable-next-line
const preventHover = (e: any) => {
  e.preventDefault();
};
