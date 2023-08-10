import type { Ref, SelectHTMLAttributes } from 'react';
import { useRef } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { Icon } from '..';
import { defaultSelectElement } from '../../utils/shared';
import * as SelectPrimitive from '@radix-ui/react-select';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, ...props }, ref) => (
    <div className="flex items-center relative">
      <select
        ref={ref}
        {...props}
        className={classNames(
          defaultSelectElement(hasError),
          className,
          'appearance-none rounded-md'
        )}
      />
      <Icon
        name="chevron-down"
        className="absolute right-4 z-10 pointer-events-none"
      />
    </div>
  )
);

export type RichSelectProps = React.ComponentProps<
  typeof SelectPrimitive.Root
> & {
  placeholder: string;
  hasError?: boolean;
  id?: string;
  'data-testid'?: string;
};
export const RichSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  RichSelectProps
>(({ id, children, placeholder, hasError, ...props }, forwardedRef) => {
  const containerRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();

  return (
    <div
      ref={containerRef as Ref<HTMLDivElement>}
      className="flex items-center relative"
    >
      <SelectPrimitive.Root {...props} defaultOpen={false}>
        <SelectPrimitive.Trigger
          data-testid={props['data-testid'] || 'rich-select-trigger'}
          className={classNames(
            defaultSelectElement(hasError),
            'rounded-md pl-2 pr-11',
            'max-w-full overflow-hidden break-all'
          )}
          id={id}
          ref={forwardedRef}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className={classNames('absolute right-4')}>
            <Icon name="chevron-down" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal container={containerRef.current}>
          <SelectPrimitive.Content
            ref={contentRef as Ref<HTMLDivElement>}
            className={classNames(
              'relative',
              'z-20',
              'bg-white dark:bg-black',
              'border border-neutral-500 focus:border-black dark:focus:border-white rounded',
              'overflow-hidden',
              'shadow-lg'
            )}
            position={'item-aligned'}
            side={'bottom'}
            align={'center'}
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 absolute w-full h-6 z-20 bg-gradient-to-t from-transparent to-neutral-50 dark:to-neutral-900">
              <Icon name="chevron-up" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 absolute bottom-0 w-full h-6 z-20 bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-900">
              <Icon name="chevron-down" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
});

export const Option = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={classNames(
      'relative',
      'text-black dark:text-white',
      'cursor-pointer outline-none',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-neutral-100 dark:focus:bg-neutral-800',
      'pl-2 py-2',
      'pr-12',
      'w-full',
      'text-sm',
      'data-selected:bg-vega-yellow dark:data-selected:text-black dark:data-selected:bg-vega-yellow',
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-4 top-[50%] translate-y-[-50%]">
      <Icon name="tick" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
