import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { forwardRef } from 'react';
import { Icon } from '../icon';

/**
 * The button that toggles the dropdown menu inside grids.
 * By default, the {@link DropdownMenuContent} will position itself against the trigger.
 */
export const DropdownMenuGridTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, forwardedRef) => {
  const triggerClasses = classNames(
    className,
    'hover:bg-neutral-500/20 dark:hover:bg-neutral-500/40',
    'p-0.5 mr-2 focus:rounded-full hover:rounded-full'
  );
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={true}
      ref={forwardedRef}
      className={triggerClasses}
      {...props}
    >
      <button>
        <Icon name="more" size={4} />
      </button>
    </DropdownMenuPrimitive.Trigger>
  );
});
