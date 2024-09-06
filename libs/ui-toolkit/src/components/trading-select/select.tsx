import type { ReactNode, SelectHTMLAttributes } from 'react';
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
          defaultSelectElement(hasError),
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
  valueElement?: ReactNode;
  hasError?: boolean;
  id?: string;
  'data-testid'?: string;
};
export const TradingRichSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  TradingRichSelectProps
>(
  (
    { id, children, valueElement, placeholder, hasError, ...props },
    forwardedRef
  ) => {
    return (
      <SelectPrimitive.Root {...props} defaultOpen={false}>
        <SelectPrimitive.Trigger
          data-testid={props['data-testid'] || 'rich-select-trigger'}
          className={[
            defaultSelectElement(hasError),
            'relative rounded-md pl-2 pr-8 text-left h-10',
            'max-w-full overflow-hidden break-all',
            '[&_>span]:flex-1',
          ].join(' ')}
          id={id}
          ref={forwardedRef}
        >
          {valueElement || <SelectPrimitive.Value placeholder={placeholder} />}
          <SelectPrimitive.Icon className="absolute right-2">
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="relative w-full z-20 bg-surface-2 border border-gs-300 dark:border-gs-700 rounded overflow-hidden shadow-lg"
            position="item-aligned"
            align="start"
            side="bottom"
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-t from-transparent to-gs-100">
              <VegaIcon name={VegaIconNames.CHEVRON_UP} />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-b from-transparent to-gs-100">
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

export const TradingRichSelectValue = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentProps<typeof SelectPrimitive.Value>
>(({ children, placeholder }, ref) => {
  return (
    <SelectPrimitive.Value ref={ref} placeholder={placeholder}>
      {children}
    </SelectPrimitive.Value>
  );
});

export const TradingRichSelectOption = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={[
      'relative text-sm w-full p-2 h-14 overflow-hidden',
      'cursor-pointer outline-none',
      'hover:bg-surface-1 focus:bg-surface-1',
      'data-selected:bg-blue-300 dark:data-selected:bg-blue-600',
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
  trigger?: string;
};

export const MiniSelect = ({
  id,
  children,
  placeholder,
  hasError,
  trigger,
  ...props
}: MiniSelectProps) => {
  return (
    <SelectPrimitive.Root {...props} defaultOpen={false}>
      <SelectPrimitive.Trigger
        data-testid={props['data-testid'] || 'rich-select-trigger'}
        id={id}
        className="inline-flex items-center gap-1.5 text-xs py-px"
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {trigger}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="text-surface-0-fg-muted">
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative w-full z-20 bg-surface-2 border border-gs-300 dark:border-gs-700 rounded overflow-hidden shadow-lg"
          position="popper"
          align="start"
          side="bottom"
          data-testid="mini-select-content"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-t from-transparent to-gs-100">
            <VegaIcon name={VegaIconNames.CHEVRON_UP} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center w-full h-6 py-1 bg-gradient-to-b from-transparent to-gs-100">
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export const MiniSelectOption = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <SelectPrimitive.Item
    data-testid="rich-select-option"
    className={[
      'relative text-sm w-full p-2',
      'cursor-pointer outline-none ',
      'hover:bg-surface-1 focus:bg-surface-1',
      'data-selected:bg-blue-300 dark:data-selected:bg-blue-600',
      className,
    ].join(' ')}
    {...props}
    ref={forwardedRef}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
