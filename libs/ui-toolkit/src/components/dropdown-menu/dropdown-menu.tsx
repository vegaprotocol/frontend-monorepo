import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { forwardRef } from 'react';

const itemStyles = classNames([
  'text-ui',
  'text-black',
  'dark:text-white',
  'flex',
  'items-center',
  'justify-between',
  'leading-1',
  'cursor-default',
  'select-none',
  'whitespace-nowrap',
  'h-[25px]',
  'py-0',
  'pr-8',
  'color-black',
]);

const itemClass = classNames(itemStyles, [
  'focus:bg-vega-yellow',
  'dark:focus:bg-vega-yellow',
  'focus:text-black',
  'dark:focus:text-black',
  'focus:outline-none',
]);

function getItemClasses(inset: boolean) {
  return classNames(itemClass, inset ? 'pl-28' : 'pl-4', 'relative');
}

/**
 * Contains all the parts of a dropdown menu.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;

/**
 * The button that toggles the dropdown menu.
 * By default, the {@link DropdownMenuContent} will position itself against the trigger.
 */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

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
    className={classNames(
      'inline-block box-border border-1 border-black bg-white dark:bg-black p-4',
      className
    )}
  />
));

/**
 * The component that contains the dropdown menu items.
 */
export const DropdownMenuItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset = false, ...itemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    {...itemProps}
    ref={forwardedRef}
    className={classNames(getItemClasses(inset), className)}
  />
));

/**
 * An item that can be controlled and rendered like a checkbox.
 */
export const DropdownMenuCheckboxItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
    inset?: boolean;
  }
>(({ className, inset = false, ...checkboxItemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.CheckboxItem
    {...checkboxItemProps}
    ref={forwardedRef}
    className={classNames(getItemClasses(inset), className)}
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
>(({ className, inset = false, ...radioItemprops }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioItem
    {...radioItemprops}
    ref={forwardedRef}
    className={classNames(getItemClasses(inset), className)}
  />
));

/**
 * Renders when the parent {@link DropdownMenuCheckboxItem} or {@link DropdownMenuRadioItem} is checked.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export const DropdownMenuItemIndicator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.ItemIndicator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>
>(({ className, ...itemIndicatorProps }, forwardedRef) => (
  <DropdownMenuPrimitive.ItemIndicator
    {...itemIndicatorProps}
    ref={forwardedRef}
    className={classNames(
      'absolute inline-flex justify-center align-middle left-0 w-24',
      className
    )}
  />
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
    className={classNames('h-px my-1 mx-2.5 bg-black', className)}
  />
));
