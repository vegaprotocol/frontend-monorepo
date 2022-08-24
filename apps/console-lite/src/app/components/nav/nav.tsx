import { routerConfig } from '../../routes';
import { NavLink } from 'react-router-dom';
import { NavItem } from './nav-item';
import React from 'react';

interface NavProps {
  className?: string;
  tabs?: boolean;
}

export const Nav = ({ className, tabs = false }: NavProps) => {
  return (
    <nav role={tabs ? 'tablist' : 'menu'} className={className}>
      {routerConfig
        .filter((r) => r.isNavItem)
        .map((r) => (
          <NavLink
            role={tabs ? 'tab' : 'menuitem'}
            key={r.name}
            to={r.path}
            className={({ isActive }) =>
              `text-h5 block md:mb-40 px-40 md:text-black md:dark:text-white ${
                isActive && 'text-white md:text-blue md:dark:text-blue'
              }`
            }
          >
            <NavItem iconName={r.icon} label={r.text} />
          </NavLink>
        ))}
    </nav>
  );
};
