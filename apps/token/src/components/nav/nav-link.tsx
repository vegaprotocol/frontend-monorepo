import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import type { HTMLAttributeAnchorTarget, ReactNode } from 'react';
import {
  getNavLinkClassNames,
} from '@vegaprotocol/ui-toolkit';

export type NavbarTheme = 'inherit' | 'dark' | 'yellow';

interface AppNavLinkProps {
  name: ReactNode | string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  target?: HTMLAttributeAnchorTarget;
  end?: boolean;
  fullWidth?: boolean;
}

export const AppNavLink = ({
  name,
  path,
  navbarTheme,
  target,
  testId,
  end = false,
  fullWidth = false,
}: AppNavLinkProps) => {
  const borderClasses = classNames('absolute h-1 w-full bottom-[-1px] left-0', {
    'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
    'bg-black': navbarTheme === 'yellow',
  });
  return (
    <NavLink
      key={path}
      data-testid={testId}
      to={{ pathname: path }}
      className={getNavLinkClassNames(navbarTheme, fullWidth)}
      target={target}
      end={end}
    >
      {({ isActive }) => {
        return (
          <>
            {name}
            {isActive && <span data-testid='link-active' className={borderClasses} />}
          </>
        );
      }}
    </NavLink>
  );
};
