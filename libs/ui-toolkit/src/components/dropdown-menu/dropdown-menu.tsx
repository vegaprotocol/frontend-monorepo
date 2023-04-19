import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { Icon } from '../icon';

const itemClass = classNames(
  'relative flex items-center justify-between rounded-sm p-2 text-sm',
  'cursor-default hover:cursor-pointer',
  'hover:bg-white dark:hover:bg-neutral-500',
  'focus:bg-white dark:focus:bg-neutral-500',
  'select-none',
  'whitespace-nowrap'
);

type DropdownMenuProps = DropdownMenuPrimitive.DropdownMenuProps & {
  trigger: ReactNode;
};
/**
 * Contains all the parts of a dropdown menu.
 */
export const DropdownMenu = ({
  children,
  trigger,
  ...props
}: DropdownMenuProps) => {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      {trigger}
      <DropdownMenuPrimitive.Portal>{children}</DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
/**
 * The button that toggles the dropdown menu.
 * By default, the {@link DropdownMenuContent} will position itself against the trigger.
 */
export const DropdownMenuTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, forwardedRef) => {
  const triggerClasses = classNames(
    className,
    'text-sm py-1 px-2 rounded bg-transparent border border-neutral-500 whitespace-nowrap',
    'dark:hover:bg-neutral-500/20 hover:bg-neutral-500/40'
  );
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={true}
      ref={forwardedRef}
      className={triggerClasses}
      {...props}
    >
      <button>
        {children} <Icon name="chevron-down" className="ml-2" />
      </button>
    </DropdownMenuPrimitive.Trigger>
  );
});

/**
 * Used to group multiple {@link DropdownMenuRadioItem}s.
 */
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * The component that pops out when the dropdown menu is open.
 */
export const DropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>
>(({ className, ...contentProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Content
    {...contentProps}
    ref={forwardedRef}
    className="min-w-[290px] bg-neutral-100 dark:bg-neutral-900 p-2 rounded z-20 text-black dark:text-white dark:border-neutral-700 border border-neutral-300"
    align="start"
    sideOffset={10}
  />
));

/**
 * The component that contains the dropdown menu items.
 */
export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>
>(({ className, ...itemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    {...itemProps}
    ref={forwardedRef}
    className={classNames(itemClass, className)}
  />
));

/**
 * An item that can be controlled and rendered like a checkbox.
 */
export const DropdownMenuCheckboxItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, ...checkboxItemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.CheckboxItem
    {...checkboxItemProps}
    ref={forwardedRef}
    className={classNames(itemClass, className)}
  />
));

/**
 * An item that can be controlled and rendered like a radio.
 */
export const DropdownMenuRadioItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
    inset?: boolean;
  }
>(({ className, inset = false, ...radioItemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioItem
    {...radioItemProps}
    ref={forwardedRef}
    className={classNames(itemClass, className)}
  />
));

/**
 * Renders when the parent {@link DropdownMenuCheckboxItem} or {@link DropdownMenuRadioItem} is checked.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export const DropdownMenuItemIndicator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.ItemIndicator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>
>(({ ...itemIndicatorProps }, forwardedRef) => (
  <DropdownMenuPrimitive.ItemIndicator
    {...itemIndicatorProps}
    ref={forwardedRef}
    className="flex-end"
  >
    <Icon name="tick" />
  </DropdownMenuPrimitive.ItemIndicator>
));

/**
 * Used to visually separate items in the dropdown menu.
 */
export const DropdownMenuSeparator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...separatorProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Separator
    {...separatorProps}
    ref={forwardedRef}
    className={classNames(
      'h-px my-1 mx-2 bg-neutral-400 dark:bg-neutral-300',
      className
    )}
  />
));
