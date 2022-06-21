import React from 'react';
import { useRoutes, NavLink } from 'react-router-dom';
import {
  NavigationDrawer,
  DrawerWrapper,
  DrawerContent,
  DrawerToggle,
  DRAWER_TOGGLE_VARIANTS,
} from '../drawer';
import { NavItem } from '../nav';
import { routerConfig } from '../../routes/router-config';

export interface RouteChildProps {
  name: string;
}

export const AppRouter = () => {
  const routes = useRoutes(routerConfig);

  return <main className="p-20 overflow-hidden">{routes}</main>;
};

export const Menu = () => (
  <nav className="my-20 h-full">
    {routerConfig.map((r) => (
      <NavLink
        key={r.name}
        to={r.path}
        className={({ isActive }) =>
          `text-h5 text-black dark:text-white block mb-40 px-40 hover:text-blue ${
            isActive && 'text-blue dark:text-blue'
          }`
        }
      >
        <NavItem iconName={r.icon} label={r.text} />
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
      <NavigationDrawer rtl onToggle={onToggle} isMenuOpen={isMenuOpen}>
        <DrawerToggle
          onToggle={onToggle}
          variant={DRAWER_TOGGLE_VARIANTS.CLOSE}
          className="p-16"
        />
        <Menu />
      </NavigationDrawer>
      <DrawerContent>
        <AppRouter />
      </DrawerContent>
    </DrawerWrapper>
  );
};
