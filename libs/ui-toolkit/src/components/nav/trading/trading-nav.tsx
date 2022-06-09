import classnames from 'classnames';
import { VegaLogo } from '../../vega-logo';
import type { MouseEvent } from 'react';

interface NavItemProps {
  name: string;
  path: string;
  isActive: boolean;
  onClick?: (e: MouseEvent) => null;
  className?: string;
}

const NavItem = ({
  name,
  path,
  isActive,
  onClick,
  className,
}: NavItemProps) => {
  const classes = classnames(
    className,
    'w-full uppercase text-h4 font-normal border-2 py-4 px-12 focus-visible:outline-none dark:focus-visible:outline-none',
    {
      'border-transparent hover:bg-vega-pink hover:dark:bg-vega-yellow':
        !isActive,
      'text-inherit dark:text-inherit hover:text-white hover:dark:text-black':
        !isActive,
      'focus-visible:inset-shadow-vega-pink dark:focus-visible:inset-shadow-vega-yellow':
        !isActive,
      'focus-visible:inset-shadow-white dark:focus-visible:inset-shadow-black':
        isActive,
      'border-vega-pink dark:border-vega-yellow bg-vega-pink dark:bg-vega-yellow text-white dark:text-black':
        isActive,
    }
  );
  return (
    <li className="flex items-center w-full sm:w-auto">
      {isActive ? (
        <span className={`${classes} active`}>{name}</span>
      ) : (
        <a className={classes} href={path} onClick={onClick}>
          {name}
        </a>
      )}
    </li>
  );
};

interface NavbarProps {
  navItems?: NavItemProps[];
  menuName?: string;
  menuId?: string;
  showHomeLogo?: boolean;
  fairground?: boolean;
}

export const Navbar = ({
  navItems,
  menuName,
  menuId,
  showHomeLogo,
  fairground,
}: NavbarProps) => {
  const navClasses = classnames(
    'flex flex-col sm:flex-row items-start sm:items-center',
    'border-l-7 sm:border-l-0 sm:border-b-7 border-vega-pink dark:border-vega-yellow',
    'py-8 lg:py-0',
    'text-white',
    {
      'bg-fairground-nav': fairground,
      'bg-black': !fairground,
    }
  );

  return (
    <nav className={navClasses} aria-labelledby={menuId}>
      {menuId && menuName && (
        <h2 id={menuId} className="sr-only" data-testid="menu-label">
          {menuName}
        </h2>
      )}
      {showHomeLogo && (
        <a href="/" className="p-12 sm:px-24" data-testid="home-logo">
          <VegaLogo />
        </a>
      )}
      <ul className="w-full flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-12 pt-4 sm:pt-0">
        {navItems &&
          navItems.map((item) => <NavItem key={item.path} {...item} />)}
      </ul>
    </nav>
  );
};
