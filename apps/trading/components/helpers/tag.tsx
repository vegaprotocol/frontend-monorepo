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
        'border-vega-yellow-550  text-vega-yellow-550 dark:border-vega-yellow-500  dark:text-vega-yellow-500':
          color === 'yellow',
        'border-vega-green-550  text-vega-green-550 dark:border-vega-green-500  dark:text-vega-green-500':
          color === 'green',
        'border-vega-blue-500  text-vega-blue-500': color === 'blue',
        'border-vega-purple-500  text-vega-purple-500': color === 'purple',
        'border-vega-pink-500  text-vega-pink-500': color === 'pink',
        'border-vega-orange-500  text-vega-orange-500': color === 'orange',
        'border-gs-100  text-gs-100   ': color === 'none',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
);
