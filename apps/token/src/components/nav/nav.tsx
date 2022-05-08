import { Drawer } from '@blueprintjs/core';
import debounce from 'lodash/debounce';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';

import { Flags } from '../../config';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import vegaWhite from '../../images/vega_white.png';
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
      className={`p-8 ${
        inverted
          ? 'bg-clouds bg-no-repeat bg-cover bg-vega-yellow'
          : 'border-b-white border-b-1'
      }`}
    >
      {isDesktop && <NavHeader fairground={inverted} />}
      <div className="flex justify-between items-center mx-auto gap-12 lg:justify-start lg:ml-8">
        {!isDesktop && <NavHeader fairground={inverted} />}
        <div className="flex gap-12 lg:flex-auto">
          {isDesktop ? (
            <NavLinks isDesktop={isDesktop} />
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
    <div className="h-[30px] inline-flex items-center ml-8 lg:h-40 uppercase">
      <Link to="/">
        {fairground ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="33"
            height="20"
            viewBox="0 0 200 116"
            fill="none"
            data-testid="fairground-icon"
          >
            <g clip-path="url(#clip0)">
              <path
                d="M70.5918 32.8569L70.5918 22.7932L60.5254 22.7932L60.5254 32.8569L70.5918 32.8569Z"
                fill="black"
              ></path>
              <path
                d="M80.6641 83.2006L80.6641 73.1377L70.5977 73.1377L70.5977 83.2006L80.6641 83.2006Z"
                fill="black"
              ></path>
              <path
                d="M70.5918 93.2409L70.5918 83.1772L60.5254 83.1772L60.5254 93.2409L70.5918 93.2409Z"
                fill="black"
              ></path>
              <path
                d="M100.797 93.2636L100.797 73.1377L90.7305 73.1377L90.7305 93.2636L100.797 93.2636Z"
                fill="black"
              ></path>
              <path
                d="M90.7285 103.33L90.7285 93.2671L80.662 93.2671L80.662 103.33L90.7285 103.33Z"
                fill="black"
              ></path>
              <path
                d="M90.7285 22.8026L90.7285 12.74L80.662 12.74L80.662 22.8026L90.7285 22.8026Z"
                fill="black"
              ></path>
              <path
                d="M110.869 12.6108L110.869 2.54785L100.803 2.54785L100.803 12.6108L110.869 12.6108Z"
                fill="black"
              ></path>
              <path
                d="M120.934 103.326L120.934 73.1377L110.867 73.1377L110.867 103.326L120.934 103.326Z"
                fill="black"
              ></path>
              <path
                d="M110.869 113.384L110.869 103.321L100.803 103.321L100.803 113.384L110.869 113.384Z"
                fill="black"
              ></path>
              <path
                d="M161.328 52.9855L161.328 42.9226L151.262 42.9226L151.262 52.9855L161.328 52.9855Z"
                fill="black"
              ></path>
              <path
                d="M20.133 83.187L30.3354 83.187L30.3354 73.124L40.4017 73.124L40.4017 63.0613L50.4681 63.0613L50.4681 73.124L60.5345 73.124L60.5345 63.0613L70.6008 63.0613L80.6672 63.0613L131.135 63.0613L131.135 113.376L161.334 113.376L161.334 103.313L171.4 103.313L171.4 93.25L181.467 93.25L181.467 83.187L191.533 83.187L191.533 63.0613L181.467 63.0613L181.467 73.1241L171.4 73.1241L171.4 83.187L161.334 83.187L161.334 73.1241L171.4 73.1241L171.4 63.0613L161.334 63.0613L151.268 63.0613L141.201 63.0613L141.201 52.9983L141.201 32.8726L161.334 32.8726L171.4 32.8726L171.4 63.0613L181.467 63.0613L181.467 52.9983L191.533 52.9983L191.533 32.8726L181.467 32.8726L181.467 22.8096L171.4 22.8096L171.4 12.7467L161.334 12.7467L161.334 2.54785L141.201 2.54785L131.135 2.54785L131.135 52.9983L120.933 52.9983L120.933 12.7467L110.866 12.7467L110.866 52.9983L100.8 52.9983L100.8 22.8096L90.7336 22.8096L90.7336 52.9983L80.6672 52.9983L80.6672 32.8726L70.6008 32.8726L70.6008 52.9983L60.5345 52.9983L60.5345 42.9354L50.4681 42.9354L50.4681 52.9983L40.4017 52.9983L40.4017 42.9354L30.3354 42.9354L30.3354 32.8726L20.133 32.8726L20.133 22.8096L0.000308081 22.8096L0.000307201 42.9354L10.0666 42.9354L10.0666 52.9983L20.133 52.9983L20.133 63.0613L10.0666 63.0613L10.0666 73.124L0.000305881 73.124L0.000305002 93.25L20.133 93.25L20.133 83.187Z"
                fill="black"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="200" height="116" fill="none"></rect>
              </clipPath>
            </defs>
          </svg>
        ) : (
          <img alt="Vega" src={vegaWhite} className="w-[30px] lg:w-40" />
        )}
      </Link>
      <h1
        className={`text-[28px] lg:text-h3 pl-8 ${
          fairground ? 'text-black' : 'text-white'
        }`}
        data-testid="header-title"
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

      <Drawer
        isOpen={appState.drawerOpen}
        onClose={() =>
          appDispatch({
            type: AppStateActionType.SET_DRAWER,
            isOpen: false,
          })
        }
        size="80%"
        className="border border-white max-w-[420px]"
      >
        <div className="flex flex-col flex-nowrap justify-between h-full bg-banner overflow-y-scroll">
          <div>
            <DrawerSection>
              <EthWallet />
            </DrawerSection>
            <DrawerSection>
              <VegaWallet />
            </DrawerSection>
          </div>
          <NavLinks isDesktop={false} />
        </div>
      </Drawer>
    </>
  );
};

const NavLinks = ({ isDesktop }: { isDesktop: boolean }) => {
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
  return (
    <nav
      className={`flex uppercase
      ${isDesktop ? 'flex-row mt-8' : 'flex-col'}`}
    >
      {routes.map(({ route, text }) => (
        <NavLink
          {...linkProps}
          to={route}
          className={({ isActive }) =>
            `no-underline hover:no-underline
            ${
              isDesktop
                ? `py-4 px-16 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-transparent text-black hover:text-white'
                  }`
                : `border-t border-white p-20 ${
                    isActive
                      ? 'bg-vega-yellow text-black hover:text-black'
                      : 'bg-black text-white hover:text-vega-yellow'
                  }`
            }`
          }
        >
          {text}
        </NavLink>
      ))}
    </nav>
  );
};
