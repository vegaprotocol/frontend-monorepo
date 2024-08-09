import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@vegaprotocol/ui-toolkit';
import { forwardRef, type ReactNode } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';

type MultiSelectProps = React.ComponentProps<typeof DropdownPrimitive.Root> & {
  trigger?: ReactNode;
  placeholder?: string;
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
        className={cn(
          'relative',
          'text-sm px-3 py-1.5 pr-6 h-8',
          'flex items-center justify-between border rounded gap-1',
          'border-gs-600  bg-gs-700 ',
          'text-secondary data-[state=open]:text-gs-50'
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
        className={cn(
          'bg-gs-700 ',
          'border-gs-500  border',
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
    className={cn(
      'relative flex gap-2 items-center rounded-sm p-1 text-sm',
      'cursor-default hover:cursor-pointer',
      'text-secondary hover:text-gs-50',
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
    className={cn('w-4 h-4', 'relative', 'rounded-sm border-gs-500  border')}
  >
    {checked && (
      <VegaIcon
        className="text-gs-900 absolute top-0 left-0"
        name={VegaIconNames.TICK}
        size={14}
      />
    )}
  </div>
);
