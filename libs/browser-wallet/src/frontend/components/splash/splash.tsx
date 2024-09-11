import { cn } from '@vegaprotocol/ui-toolkit';
import type { HTMLAttributes, ReactNode } from 'react';

interface SplashProperties extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  centered?: boolean;
}

/**
 * Component to display content centered in the middle of the screen
 */
export function Splash({
  children,
  centered = false,
  className,
  ...properties
}: Readonly<SplashProperties>) {
  return (
    <div
      {...properties}
      className={cn(
        'bg-surface-0 z-[15] flex flex-col items-center justify-start',
        'w-full h-full overflow-y-auto text-surface-0-fg',
        className
      )}
    >
      <div
        className={cn('h-full w-full min-h-full max-w-full', {
          'flex flex-col justify-center': centered,
        })}
      >
        {children}
      </div>
    </div>
  );
}
