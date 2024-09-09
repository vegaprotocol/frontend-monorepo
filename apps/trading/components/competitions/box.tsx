import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const Box = ({
  children,
  backgroundImage,
  ...props
}: HTMLAttributes<HTMLDivElement> & { backgroundImage?: string }) => {
  return (
    <div
      {...props}
      className={cn(
        'border',
        'bg-gradient-to-b from-surface-1/70 to-surface-1/50',
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
