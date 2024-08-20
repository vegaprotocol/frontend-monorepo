import { cn } from '@vegaprotocol/ui-toolkit';
import { type ButtonHTMLAttributes } from 'react';

type RainbowButtonProps = {
  variant?: 'full' | 'border';
};

export const RainbowButton = ({
  variant = 'full',
  children,
  className,
  ...props
}: RainbowButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'bg-rainbow rounded-lg overflow-hidden disabled:opacity-40',
      'hover:bg-rainbow-180 hover:animate-spin-rainbow',
      {
        'px-5 py-3 text-white': variant === 'full',
        'p-[0.125rem]': variant === 'border',
      },
      className
    )}
    {...props}
  >
    <div
      className={cn({
        'bg-surface-1 text-surface-0-fg px-5 py-3 rounded overflow-hidden':
          variant === 'border',
      })}
    >
      {children}
    </div>
  </button>
);
