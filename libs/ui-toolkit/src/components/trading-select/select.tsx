import type { Ref, SelectHTMLAttributes } from 'react';
import { useRef } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
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
        className={classNames(
          defaultSelectElement(hasError, props.disabled),
          className,
          'appearance-none rounded-md'
        )}
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
  const containerRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();

  return (
    <div
      ref={containerRef as Ref<HTMLDivElement>}
      className="relative flex items-center"
    >
      <SelectPrimitive.Root {...props} defaultOpen={false}>
        <SelectPrimitive.Trigger
          data-testid={props['data-testid'] || 'rich-select-trigger'}
          className={classNames(
            defaultSelectElement(hasError, props.disabled),
            'rounded-md pl-2 pr-8 text-left',
            'max-w-full overflow-hidden break-all',
            '[&_>span]:flex-1'
          )}
          id={id}
          ref={forwardedRef}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className={classNames('absolute right-2')}>
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal container={containerRef.current}>
          <SelectPrimitive.Content
            ref={contentRef as Ref<HTMLDivElement>}
            className={classNames(
              'relative',
              'z-20',
              'bg-white dark:bg-black',
              'border border-default rounded',
              'overflow-hidden',
              'shadow-lg'
            )}
            position={'item-aligned'}
            side={'bottom'}
            align={'center'}
          >
            <SelectPrimitive.ScrollUpButton className="absolute z-20 flex items-center justify-center w-full h-6 py-1 bg-gradient-to-t from-transparent to-neutral-50 dark:to-neutral-900">
              <VegaIcon name={VegaIconNames.CHEVRON_UP} />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="absolute bottom-0 z-20 flex items-center justify-center w-full h-6 py-1 bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-900">
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
});

export const TradingOption = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={classNames(
      'relative text-sm w-full p-2',
      'cursor-pointer outline-none ',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-neutral-100 dark:focus:bg-neutral-800',
      'data-selected:bg-vega-blue-300 dark:data-selected:bg-vega-blue-600',
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
