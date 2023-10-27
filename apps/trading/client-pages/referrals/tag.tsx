import type { HTMLAttributes } from 'react';
import classNames from 'classnames';

type TagProps = {
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'none';
};
export const Tag = ({
  color = 'none',
  children,
  className,
  ...props
}: TagProps & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      'w-max border rounded-[1rem] py-[0.125rem] px-2 text-xs',
      {
        'border-vega-yellow-500  text-vega-yellow-500': color === 'yellow',
        'border-vega-green-500  text-vega-green-500': color === 'green',
        'border-vega-blue-500  text-vega-blue-500': color === 'blue',
        'border-vega-purple-500  text-vega-purple-500': color === 'purple',
        'border-vega-pink-500  text-vega-pink-500': color === 'pink',
        'border-vega-orange-500  text-vega-orange-500': color === 'orange',
        'border-vega-clight-100  text-vega-clight-100 dark:border-vega-cdark-100  dark:text-vega-cdark-100':
          color === 'none',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
);
