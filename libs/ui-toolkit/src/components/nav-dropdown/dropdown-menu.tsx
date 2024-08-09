import { cn } from '@vegaprotocol/utils';
import { Icon } from '../icon';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

const itemClass = cn(
  'relative flex items-center justify-between rounded-sm',
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
  const triggerClasses = cn(className, 'bg-transparent whitespace-nowrap');
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
    className="z-10 bg-gs-100 mt-4 py-4 rounded-xl border border-gs-200 text-gs-900"
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
    className={cn(itemClass, className)}
  />
));
