import React from 'react';
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

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  return <main className="p-20 overflow-hidden">{routes}</main>;
};

interface Props {
  onToggle(): void;
  isMenuOpen: boolean;
}

export const Main = ({ onToggle, isMenuOpen }: Props) => {
  return (
    <DrawerWrapper>
      <NavigationDrawer rtl onToggle={onToggle} isMenuOpen={isMenuOpen}>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.CLOSE}
          className="p-16"
        />
        <Nav className="hidden md:block my-20 h-full" />
      </NavigationDrawer>
      <DrawerContent>
        <AppRouter />
        <TabBar />
      </DrawerContent>
    </DrawerWrapper>
  );
};
