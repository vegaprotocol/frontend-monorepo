import classnames from 'classnames';
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
      className={classnames(
        'bg-black z-[15] fixed flex flex-col items-center justify-start',
        'w-full h-full top-0 left-0 right-0 overflow-y-auto text-white',
        className
      )}
    >
      <div
        className={classnames('h-full w-full min-h-full max-w-full', {
          'flex flex-col justify-center': centered,
        })}
      >
        {children}
      </div>
    </div>
  );
}
