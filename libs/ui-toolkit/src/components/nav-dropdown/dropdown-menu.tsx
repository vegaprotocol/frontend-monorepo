import classNames from 'classnames';
import { Icon } from '../icon';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

const itemClass = classNames(
  'relative flex items-center justify-between rounded-sm p-2 text-sm',
  'cursor-default hover:cursor-pointer',
  'hover:white dark:hover:white',
  'focus:white dark:focus:white',
  'select-none',
  'whitespace-nowrap'
);

/**
 * Contains all the parts of a dropdown menu.
 */
export const NavDropdownMenu = DropdownMenuPrimitive.Root;

/**
 * The button that toggles the dropdown menu.
 * By default, the {@link NavDropdownMenuContent} will position itself against the trigger.
 */
export const NavDropdownMenuTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, forwardedRef) => {
  const triggerClasses = classNames(
    className,
    'bg-transparent whitespace-nowrap'
  );
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={true}
      ref={forwardedRef}
      className={triggerClasses}
      {...props}
    >
      <span className="h-full">
        {children} <Icon name="arrow-down" className="ml-2" />
      </span>
    </DropdownMenuPrimitive.Trigger>
  );
});

/**
 * The component that pops out when the dropdown menu is open.
 */
export const NavDropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>
>(({ className, ...contentProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Content
    {...contentProps}
    ref={forwardedRef}
    className="min-w-[290px] bg-neutral-200 dark:bg-neutral-900 mt-4 p-2 rounded-xl border border-neutral-700 text-white"
    align="start"
    sideOffset={10}
  />
));

/**
 * The component that contains the dropdown menu items.
 */
export const NavDropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>
>(({ className, ...itemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    {...itemProps}
    ref={forwardedRef}
    className={classNames(itemClass, className)}
  />
));
