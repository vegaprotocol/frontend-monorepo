import type { HTMLAttributes } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';

type TagProps = {
  color?:
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'orange'
    | 'red'
    | 'none';
};
export const Tag = ({
  color = 'none',
  children,
  className,
  ...props
}: TagProps & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'w-max border rounded-[1rem] py-[0.125rem] px-2 text-xs',
      {
        'border-yellow-550  text-yellow-550 dark:border-yellow-500  dark:text-yellow-500':
          color === 'yellow',
        'border-green-550  text-green-550 dark:border-green-500  dark:text-green-500':
          color === 'green',
        'border-blue-500  text-blue-500': color === 'blue',
        'border-purple-500  text-purple-500': color === 'purple',
        'border-pink-500  text-pink-500': color === 'pink',
        'border-orange-500  text-orange-500': color === 'orange',
        'border-gs-100  text-surface-1-fg   ': color === 'none',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
);
