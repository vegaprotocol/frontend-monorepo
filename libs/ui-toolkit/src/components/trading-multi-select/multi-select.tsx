import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn';
import { forwardRef, type ReactNode } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';
import { Button } from '../button';

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
      <Button size="sm" className="justify-between">
        <span className="whitespace-nowrap">{trigger || placeholder}</span>
        <VegaIcon size={12} name={VegaIconNames.CHEVRON_DOWN} />
      </Button>
    </DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        side="bottom"
        align="start"
        sideOffset={5}
        className={cn(
          'bg-surface-1 text-surface-1-fg',
          'border border-gs-300 dark:border-gs-700',
          'relative z-20 rounded p-2'
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
      'text-surface-2-fg',
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
    className={cn(
      'w-4 h-4',
      'relative',
      'rounded-sm border-gs-300 dark:border-gs-700  border'
    )}
  >
    {checked && (
      <VegaIcon
        className="absolute top-0 left-0"
        name={VegaIconNames.TICK}
        size={14}
      />
    )}
  </div>
);
