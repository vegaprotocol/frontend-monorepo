import type { ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';
import { defaultSelectElement } from '../../utils/trading-shared';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

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

export const TradingRichSelectOption = forwardRef<
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
        className="inline-flex items-center gap-1.5 leading-3 text-xs"
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {trigger}
        </SelectPrimitive.Value>
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
          data-testid="mini-select-content"
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

type MultiSelectProps = React.ComponentProps<typeof DropdownPrimitive.Root> & {
  trigger?: ReactNode;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
};
export const MultiSelect = ({
  children,
  trigger,
  placeholder,
  ...props
}: MultiSelectProps) => (
  <DropdownPrimitive.Root {...props} defaultOpen={false}>
    <DropdownPrimitive.Trigger asChild>
      <button
        className={classNames(
          'relative',
          'text-sm px-3 py-1.5 pr-6 h-8',
          'flex items-center justify-between border rounded gap-1',
          'border-vega-clight-600 dark:border-vega-cdark-600 bg-vega-clight-700 dark:bg-vega-cdark-700',
          'text-secondary data-[state=open]:text-vega-clight-50 dark:data-[state=open]:text-vega-cdark-50'
        )}
      >
        <span className="whitespace-nowrap">{trigger || placeholder}</span>
        <VegaIcon
          size={12}
          className="absolute right-1"
          name={VegaIconNames.CHEVRON_DOWN}
        />
      </button>
    </DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        side="bottom"
        align="start"
        sideOffset={5}
        className={classNames(
          'bg-vega-clight-700 dark:bg-vega-cdark-700',
          'border-vega-clight-500 dark:border-vega-cdark-500 border',
          'relative text-default z-20 rounded p-2'
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>
);

export const MultiSelectOption = forwardRef<
  React.ElementRef<typeof DropdownPrimitive.CheckboxItem>,
  React.ComponentProps<typeof DropdownPrimitive.CheckboxItem>
>(({ children, checked, ...props }, forwardedRef) => (
  <DropdownPrimitive.CheckboxItem
    checked={checked}
    className={classNames(
      'relative flex gap-2 items-center rounded-sm p-1 text-sm',
      'cursor-default hover:cursor-pointer',
      'text-secondary hover:text-vega-clight-50 dark:hover:text-vega-cdark-50',
      'select-none',
      'whitespace-nowrap'
    )}
    onSelect={(e) => {
      e.preventDefault();
    }}
    ref={forwardedRef}
    {...props}
  >
    <PseudoCheckbox checked={checked} />
    <div>{children}</div>
  </DropdownPrimitive.CheckboxItem>
));

export const PseudoCheckbox = ({
  checked,
}: {
  checked?: boolean | 'indeterminate';
}) => (
  <div
    className={classNames(
      'w-4 h-4',
      'relative',
      'rounded-sm border-vega-clight-500 dark:border-vega-cdark-500 border'
    )}
  >
    {checked && (
      <VegaIcon
        className="text-vega-cdark-900 dark:text-vega-clight-900 absolute top-0 left-0"
        name={VegaIconNames.TICK}
        size={14}
      />
    )}
  </div>
);
