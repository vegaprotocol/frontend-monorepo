import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface SplashProps {
  children: ReactNode;
  className?: classNames.Argument;
}

export const Splash = ({ children, className }: SplashProps) => {
  const splashClasses = classNames(
    'w-full h-full text-xs text-center text-gray-800 dark:text-gray-200',
    'flex items-center justify-center',
    className
  );
  return <div className={splashClasses}>{children}</div>;
};
