import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { BORDER_COLOR, GRADIENT } from './constants';

type TileProps = {
  variant?: 'rainbow' | 'default';
};

export const Tile = ({
  variant = 'default',
  className,
  children,
}: TileProps & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        {
          'bg-rainbow p-[0.125rem]': variant === 'rainbow',
          [`border-2 ${BORDER_COLOR} p-0`]: variant === 'default',
        },
        'rounded-lg overflow-hidden'
      )}
    >
      <div
        className={classNames(
          {
            'bg-white dark:bg-vega-cdark-900 text-black dark:text-white rounded-[0.35rem] overflow-hidden':
              variant === 'rainbow',
          },
          'p-6',
          GRADIENT,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
