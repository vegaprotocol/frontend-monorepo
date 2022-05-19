import React from 'react';
import { useRoutes, NavLink } from 'react-router-dom';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import {
  NavigationDrawer,
  DrawerWrapper,
  DrawerContainer,
  DrawerToggle,
  DRAWER_TOGGLE_VARIANTS,
} from '../drawer';
import { routerConfig } from '../../routes/router-config';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  const splashLoading = (
    <Splash>
      <Loader />
    </Splash>
  );

  return (
    <main className="p-20 overflow-hidden">
      <React.Suspense fallback={splashLoading}>{routes}</React.Suspense>
    </main>
  );
};

export const Menu = () => (
  <nav>
    {routerConfig.map((r) => (
      <NavLink
        key={r.name}
        to={r.path}
        className={({ isActive }) =>
          `text-h5 block mb-8 px-8 hover:bg-vega-yellow hover:text-black ${
            isActive && 'bg-vega-yellow text-black'
          }`
        }
      >
        {r.text}
      </NavLink>
    ))}
  </nav>
);

interface Props {
  onToggle(): void;

  isMenuOpen: boolean;
}

export const Main = ({ onToggle, isMenuOpen }: Props) => {
  return (
    <DrawerWrapper>
      <NavigationDrawer onToggle={onToggle} isMenuOpen={isMenuOpen}>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.CLOSE}
          className="self-end p-16"
        />
        <Menu />
      </NavigationDrawer>
      <DrawerContainer>
        <AppRouter />
      </DrawerContainer>
    </DrawerWrapper>
  );
};
