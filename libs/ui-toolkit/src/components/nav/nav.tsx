import classNames from 'classnames';
import type { ReactNode } from 'react';

export function getNavLinkClassNames(
  navbarTheme: string,
  alignRight = false
): (props: { isActive?: boolean }) => string | undefined {
  return ({ isActive = false }) => {
    return getActiveNavLinkClassNames(isActive, navbarTheme, alignRight);
  };
}

export const getActiveNavLinkClassNames = (
  isActive: boolean,
  navbarTheme: string,
  alignRight = false
): string | undefined => {
  return classNames('mx-2 py-3 self-end relative', {
    'cursor-default': isActive,
    'text-black dark:text-white': isActive && navbarTheme !== 'yellow',
    'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-300':
      !isActive && navbarTheme !== 'yellow',
    'ml-auto': alignRight,
    'text-black': isActive && navbarTheme === 'yellow',
    'text-black/60 hover:text-black': !isActive && navbarTheme === 'yellow',
  });
};

type NavbarTheme = 'inherit' | 'dark' | 'yellow';

interface NavbarProps {
  navbarTheme?: NavbarTheme;
  icon: ReactNode;
  titleContent: ReactNode;
  children: ReactNode;
  title: string;
}

export const Nav = ({
  navbarTheme = 'inherit',
  children,
  icon,
  titleContent,
  title,
}: NavbarProps) => {
  const themeWrapperClasses = classNames('w-full', {
    dark: navbarTheme === 'dark',
  });

  const isYellow = navbarTheme === 'yellow';
  const navbarClasses = classNames(
    'flex items-stretch border-b px-4 border-default',
    {
      'dark:bg-black dark:text-white': !isYellow,
      'bg-vega-yellow text-black bg-right-top bg-no-repeat bg-contain':
        isYellow,
    }
  );

  return (
    <div className={themeWrapperClasses}>
      <div className={navbarClasses}>
        <div className="flex gap-4 items-center">
          {icon}
          <h1
            className={classNames(
              'h-full flex flex-col my-0 justify-center font-alpha calt',
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
