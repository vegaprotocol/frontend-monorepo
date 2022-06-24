import './nav.css';

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { Flags } from '../../config';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Routes } from '../../routes/router-config';
import { EthWallet } from '../eth-wallet';
import { VegaWallet } from '../vega-wallet';

export const Nav = () => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const isDesktop = windowWidth > 959;
  const inverted = Flags.FAIRGROUND;

  React.useEffect(() => {
    const handleResizeDebounced = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, []);

  return (
    <div
      className={`p-16 ${
        inverted
          ? 'bg-clouds bg-no-repeat bg-cover bg-vega-yellow'
          : 'border-b-white border-b-1'
      }`}
    >
      {isDesktop && <NavHeader fairground={inverted} />}
      <div className="flex justify-between items-center mx-auto gap-12 lg:justify-start">
        {!isDesktop && <NavHeader fairground={inverted} />}
        <div className="flex gap-12 lg:flex-auto">
          {isDesktop ? (
            <NavLinks isDesktop={isDesktop} isInverted={inverted} />
          ) : (
            <NavDrawer inverted={inverted} />
          )}
        </div>
      </div>
    </div>
  );
};

const NavHeader = ({ fairground }: { fairground: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="h-[30px] inline-flex items-center lg:h-40 uppercase">
      <h1
        data-testid="header-title"
        className={`text-h3 font-alpha uppercase calt mb-2 ${
          fairground ? 'text-black' : 'text-white'
        }`}
      >
        {fairground ? t('fairgroundTitle') : t('title')}
      </h1>
    </div>
  );
};

const DrawerSection = ({ children }: { children: React.ReactNode }) => (
  <div className="p-12">{children}</div>
);

const IconLine = ({ inverted }: { inverted: boolean }) => (
  <span className={`block w-28 h-4 ${inverted ? 'bg-black' : 'bg-white'}`} />
);

const NavDrawer = ({ inverted }: { inverted: boolean }) => {
  const { appState, appDispatch } = useAppState();

  const drawerContentClasses = classNames(
    'drawer-content', // needed for css animation
    // Positions the modal in the center of screen
    'fixed w-[80vw] max-w-[420px] top-0 right-0',
    'flex flex-col flex-nowrap justify-between h-full bg-banner overflow-y-scroll border-l border-white',
    'bg-black text-white-95'
  );
  return (
    <>
      <button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_DRAWER,
            isOpen: true,
          })
        }
        className="flex flex-col flex-nowrap gap-4"
      >
        <IconLine inverted={inverted} />
        <IconLine inverted={inverted} />
        <IconLine inverted={inverted} />
      </button>

      <Dialog.Root
        open={appState.drawerOpen}
        onOpenChange={(isOpen) =>
          appDispatch({
            type: AppStateActionType.SET_DRAWER,
            isOpen,
          })
        }
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-white/15" />
          <Dialog.Content className={drawerContentClasses}>
            <div>
              <DrawerSection>
                <EthWallet />
              </DrawerSection>
              <DrawerSection>
                <VegaWallet />
              </DrawerSection>
            </div>
            <NavLinks isDesktop={false} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

const NavLinks = ({
  isDesktop,
  isInverted,
}: {
  isDesktop: boolean;
  isInverted?: boolean;
}) => {
  const { appDispatch } = useAppState();
  const { t } = useTranslation();
  const linkProps = {
    onClick: () =>
      appDispatch({ type: AppStateActionType.SET_DRAWER, isOpen: false }),
  };
  const routes = [
    { route: Routes.HOME, text: t('Home') },
    { route: Routes.VESTING, text: t('Vesting') },
    { route: Routes.STAKING, text: t('Staking') },
    { route: Routes.REWARDS, text: t('Rewards') },
    { route: Routes.WITHDRAW, text: t('Withdraw') },
    { route: Routes.GOVERNANCE, text: t('Governance') },
  ];
  const navClasses = classNames('flex', {
    'flex-row gap-8 mt-8 uppercase': isDesktop,
    'flex-col': !isDesktop,
  });

  return (
    <nav className={navClasses}>
      {routes.map(({ route, text }) => {
        return (
          <NavLink
            {...linkProps}
            to={route}
            key={route}
            className={({ isActive }) =>
              classNames(
                'no-underline hover:no-underline focus-visible:outline-none focus-visible:border-none focus-visible:shadow-inset-white',
                {
                  'bg-vega-yellow text-black': !isInverted && isActive,
                  'bg-transparent text-white hover:text-vega-yellow':
                    !isInverted && !isActive,
                  'bg-black text-white': isInverted && isActive,
                  'bg-transparent text-black hover:text-white':
                    isInverted && !isActive,
                  'py-2 px-12': isDesktop,
                  'border-t border-white p-20': !isDesktop,
                }
              )
            }
          >
            {text}
          </NavLink>
        );
      })}
    </nav>
  );
};
