import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

export interface SplashProps {
  children: ReactNode;
  className?: string;
}

export const Splash = ({ children, className }: SplashProps) => {
  const splashClasses = cn(
    'w-full h-full text-xs text-center',
    'flex items-center justify-center',
    className
  );
  return <div className={splashClasses}>{children}</div>;
};
