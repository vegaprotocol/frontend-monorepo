import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export interface SplashProps {
  children: ReactNode;
  className?: string;
}

export const Splash = ({ children, className }: SplashProps) => {
  const splashClasses = cn(
    'w-full h-full text-xs text-center text-gs-50',
    'flex items-center justify-center',
    className
  );
  return <div className={splashClasses}>{children}</div>;
};
