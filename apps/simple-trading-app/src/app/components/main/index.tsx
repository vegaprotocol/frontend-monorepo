import React, { useContext } from 'react';
import { useRoutes } from 'react-router-dom';
import {
  NavigationDrawer,
  DrawerWrapper,
  DrawerContent,
  DrawerToggle,
  DRAWER_TOGGLE_VARIANTS,
} from '../drawer';
import { Nav, TabBar } from '../nav';
import { routerConfig } from '../../routes/router-config';
import LocalContext from '../../context/local-context';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => useRoutes(routerConfig);

export const Main = () => {
  const {
    menu: { menuOpen, onToggle },
  } = useContext(LocalContext);
  return (
    <DrawerWrapper>
      <NavigationDrawer rtl onToggle={onToggle} isMenuOpen={menuOpen}>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.CLOSE}
          className="p-16"
        />
        <Nav className="hidden md:block my-20 h-full" />
      </NavigationDrawer>
      <DrawerContent>
        <AppRouter />
        <TabBar className="md:hidden" />
      </DrawerContent>
    </DrawerWrapper>
  );
};
