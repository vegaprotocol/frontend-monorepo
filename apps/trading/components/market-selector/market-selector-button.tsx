import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/utils';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export const MarketSelectorButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    {...props}
    className={cn(
      'flex items-center justify-between px-2 border rounded gap-1',
      'border-gs-600  bg-gs-700 ',
      'text-secondary data-[state=open]:text-gs-50'
    )}
    ref={ref}
  >
    {props.children}
    <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
  </button>
));
MarketSelectorButton.displayName = 'MarketSelectorButton';
