import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface SplashProps {
  children: ReactNode;
}

export const Splash = ({ children }: SplashProps) => {
  const splashClasses = classNames(
    'w-full h-full',
    'flex items-center justify-center'
  );
  return <div className={splashClasses}>{children}</div>;
};
