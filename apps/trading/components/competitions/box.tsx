import classNames from 'classnames';
import { type HTMLAttributes } from 'react';

export const BORDER_COLOR = 'border-vega-clight-500 dark:border-vega-cdark-500';
export const GRADIENT =
  'bg-gradient-to-b from-vega-clight-800 dark:from-vega-cdark-800 to-transparent';

export const Box = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={classNames(
        BORDER_COLOR,
        GRADIENT,
        'border rounded-lg',
        'p-6',
        props.className
      )}
    />
  );
};
