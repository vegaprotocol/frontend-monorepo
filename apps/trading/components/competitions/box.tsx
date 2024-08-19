import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const BORDER_COLOR = 'border-gs-300 dark:border-gs-700';
export const GRADIENT = 'bg-gradient-to-b from-surface-2 to-transparent';

export const Box = ({
  children,
  backgroundImage,
  ...props
}: HTMLAttributes<HTMLDivElement> & { backgroundImage?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        BORDER_COLOR,
        GRADIENT,
        'border rounded-lg',
        'relative p-6 overflow-hidden',
        props.className
      )}
    >
      {Boolean(backgroundImage?.length) && (
        <div
          className={cn(
            'pointer-events-none',
            'bg-no-repeat bg-center bg-[length:500px_500px]',
            'absolute top-0 left-0 w-full h-full -z-10 opacity-30 blur-lg'
          )}
          style={{ backgroundImage: `url("${backgroundImage}")` }}
        ></div>
      )}

      {children}
    </div>
  );
};
