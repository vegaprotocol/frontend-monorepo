import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export const MarketSelectorButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    {...props}
    className={classNames(
      'flex items-center justify-between px-2 border rounded gap-1',
      'border-vega-clight-600 dark:border-vega-cdark-600 bg-vega-clight-700 dark:bg-vega-cdark-700',
      'text-secondary data-[state=open]:text-vega-clight-50 dark:data-[state=open]:text-vega-cdark-50'
    )}
    ref={ref}
  >
    {props.children}
    <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
  </button>
));
MarketSelectorButton.displayName = 'MarketSelectorButton';
