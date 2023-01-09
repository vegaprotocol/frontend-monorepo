import classNames from 'classnames';
import { useState } from 'react';
import Routes from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import {
  Icon,
} from '@vegaprotocol/ui-toolkit';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import { AppNavLink, NavbarTheme } from './nav-link';

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
export const DropdownMenu = DropdownMenuPrimitive.Root;

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
    'bg-transparent whitespace-nowrap'
  );
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={true}
      ref={forwardedRef}
      className={triggerClasses}
      {...props}
    >
      <span className='h-full'>
        {children} <Icon name="arrow-down" className="ml-2" />
      </span>
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
    className="min-w-[290px] bg-neutral-200 dark:bg-neutral-900 mt-4 p-2 rounded-xl border border-neutral-700"
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
>(({ className, inset = false, ...radioItemprops }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioItem
    {...radioItemprops}
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
      'h-px my-1 mx-2 bg-neutral-700 dark:bg-black',
      className
    )}
  />
));

export const NavDropDown = ({ navbarTheme }: { navbarTheme: NavbarTheme }) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const subRoutes = [
    {
      name: t('Token'),
      testId: t('Token'),
      path: Routes.TOKEN,
    },
    {
      name: t('Supply & Vesting'),
      testId: t('Supply & Vesting'),
      path: Routes.SUPPLY,
    },
    {
      name: t('Withdraw'),
      testId: t('Withdraw'),
      path: Routes.WITHDRAWALS,
    },
    {
      name: t('Redeem'),
      testId: t('Redeem'),
      path: Routes.REDEEM,
    },
  ];
  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <AppNavLink
        name={
          <DropdownMenuTrigger
            className="w-auto text-capMenu"
            data-testid="state-trigger"
            onClick={() => setOpen(!isOpen)}
          >
            {t('Token')}
          </DropdownMenuTrigger>
        }
        testId="token-dd"
        path={Routes.TOKEN}
        navbarTheme={navbarTheme}
      />

      <DropdownMenuContent data-testid='token-dropdown'>
        {subRoutes.map((r) => (
          <DropdownMenuItem key={r.name} onClick={() => setOpen(false)}>
            <AppNavLink
              {...r}
              navbarTheme={'inherit'}
              end={true}
              fullWidth={true}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
