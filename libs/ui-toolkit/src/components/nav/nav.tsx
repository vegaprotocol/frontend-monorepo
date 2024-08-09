import { cn } from '@vegaprotocol/utils';
import type { ReactNode } from 'react';

export function getNavLinkClassNames(
  navbarTheme: string,
  fullWidth = false,
  subNav = false
): (props: { isActive?: boolean }) => string | undefined {
  return ({ isActive = false }) => {
    return getActiveNavLinkClassNames(isActive, navbarTheme, fullWidth, subNav);
  };
}

export const getActiveNavLinkClassNames = (
  isActive: boolean,
  navbarTheme: string,
  fullWidth = false,
  subNav = false
): string | undefined => {
  return cn('mx-2 lg:mx-3 self-start relative', {
    'my-4 md:my-0 md:py-3': !subNav,
    'py-2 px-4': subNav,
    'cursor-default': isActive,
    'text-gs-0': isActive && navbarTheme !== 'yellow',
    'text-gs-300 hover:text-gs-400': !isActive && navbarTheme !== 'yellow',
    'text-black dark:text-white md:dark:text-black':
      isActive && navbarTheme === 'yellow',
    'text-black/60 md:dark:text-black/60 hover:text-black':
      !isActive && navbarTheme === 'yellow',
    'flex-1': fullWidth,
  });
};

type NavbarTheme = 'inherit' | 'dark' | 'yellow';

interface NavbarProps {
  navbarTheme?: NavbarTheme;
  icon: ReactNode;
  titleContent: ReactNode;
  children: ReactNode;
  title?: string;
}

export const Nav = ({
  navbarTheme = 'inherit',
  children,
  icon,
  titleContent,
  title,
}: NavbarProps) => {
  const themeWrapperClasses = cn(
    'w-full overflow-y-hidden overflow-x-auto md:overflow-x-hidden font-alpha lg:text-lg',
    {
      dark: navbarTheme === 'dark',
    }
  );

  const isYellow = navbarTheme === 'yellow';
  const navbarClasses = cn(
    'min-w-max w-full flex items-stretch border-b px-4',
    {
      'dark:bg-black dark:text-white border-default': !isYellow,
      'border-vega-yellow bg-vega-yellow text-black bg-right-top bg-no-repeat bg-contain':
        isYellow,
    }
  );

  return (
    <div className={themeWrapperClasses} data-testid="navbar">
      <div className={navbarClasses}>
        <div className="flex gap-4 items-center">
          {icon}
          <h1
            className={cn(
              'h-full flex flex-col my-0 justify-center font-alpha calt uppercase',
              { 'text-black': isYellow, 'text-white': !isYellow }
            )}
          >
            {title}
          </h1>
          {titleContent}
        </div>
        {children}
      </div>
    </div>
  );
};
