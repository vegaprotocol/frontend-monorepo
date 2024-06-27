import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';
import { defaultSelectElement } from '../../utils/shared';
import * as SelectPrimitive from '@radix-ui/react-select';

export interface TradingSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const TradingSelect = forwardRef<HTMLSelectElement, TradingSelectProps>(
  ({ className, hasError, ...props }, ref) => (
    <div className="relative flex items-center">
      <select
        ref={ref}
        {...props}
        className={[
          defaultSelectElement(hasError, props.disabled),
          className,
          'appearance-none rounded-md',
        ].join(' ')}
      />
      <span className="absolute z-10 flex items-center pointer-events-none right-2">
        <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
      </span>
    </div>
  )
);

export type TradingRichSelectProps = React.ComponentProps<
  typeof SelectPrimitive.Root
> & {
  placeholder: string;
  hasError?: boolean;
  id?: string;
  'data-testid'?: string;
};
export const TradingRichSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  TradingRichSelectProps
>(({ id, children, placeholder, hasError, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Root {...props} defaultOpen={false}>
      <SelectPrimitive.Trigger
        data-testid={props['data-testid'] || 'rich-select-trigger'}
        className={[
          defaultSelectElement(hasError, props.disabled),
          'relative rounded-md pl-2 pr-8 text-left h-10',
          'max-w-full overflow-hidden break-all',
          '[&_>span]:flex-1',
        ].join(' ')}
        id={id}
        ref={forwardedRef}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="absolute right-2">
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative w-full z-20 bg-white dark:bg-black border border-default rounded overflow-hidden shadow-lg"
          position="item-aligned"
          align="start"
          side="bottom"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-t from-transparent to-neutral-50 dark:to-neutral-900">
            <VegaIcon name={VegaIconNames.CHEVRON_UP} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-900">
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

export const TradingOption = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={[
      'relative text-sm w-full p-2 h-14 overflow-hidden',
      'cursor-pointer outline-none',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-neutral-100 dark:focus:bg-neutral-800',
      'data-selected:bg-vega-blue-300 dark:data-selected:bg-vega-blue-600',
      className,
    ].join(' ')}
    {...props}
    ref={forwardedRef}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

export type MiniSelectProps = React.ComponentProps<
  typeof SelectPrimitive.Root
> & {
  placeholder: string;
  hasError?: boolean;
  id?: string;
  'data-testid'?: string;
};

export const MiniSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  MiniSelectProps
>(({ id, children, placeholder, hasError, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Root {...props} defaultOpen={false}>
      <SelectPrimitive.Trigger
        data-testid={props['data-testid'] || 'rich-select-trigger'}
        id={id}
        ref={forwardedRef}
        className="inline-flex items-center gap-1.5 leading-3 text-xs"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-muted">
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative w-full z-20 bg-white dark:bg-black border border-default rounded overflow-hidden shadow-lg"
          position="popper"
          align="start"
          side="bottom"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-t from-transparent to-neutral-50 dark:to-neutral-900">
            <VegaIcon name={VegaIconNames.CHEVRON_UP} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-900">
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

export const MiniSelectOption = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={[
      'relative text-sm w-full p-2',
      'cursor-pointer outline-none ',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-neutral-100 dark:focus:bg-neutral-800',
      'data-selected:bg-vega-blue-300 dark:data-selected:bg-vega-blue-600',
      className,
    ].join(' ')}
    {...props}
    ref={forwardedRef}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
