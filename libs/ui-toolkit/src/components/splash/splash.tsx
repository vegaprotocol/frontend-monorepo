import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface SplashProps {
  children: ReactNode;
}

export const Splash = ({ children }: SplashProps) => {
  const splashClasses = classNames(
    'w-full h-full text-xs text-center text-gray-200',
    'flex items-center justify-center'
  );
  return <div className={splashClasses}>{children}</div>;
};
