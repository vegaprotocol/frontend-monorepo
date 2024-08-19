import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn';
import { type ComponentProps, type ReactNode } from 'react';
import { forwardRef } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useT } from '../../use-t';

const itemClass = cn(
  'relative flex gap-2 items-center rounded-sm p-2 text-sm',
  'cursor-default hover:cursor-pointer',
  'hover:bg-surface-2',
  'focus:bg-surface-2',
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
  DropdownMenuPrimitive.DropdownMenuTriggerProps
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Trigger asChild={true} ref={forwardedRef} {...props}>
      {children}
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
>(({ className, sideOffset = 10, ...contentProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Content
    ref={forwardedRef}
    className="bg-surface-1 text-surface-1-fg border-gs-300 dark:border-gs-700 z-20 min-w-[220px] rounded border p-2"
    align="start"
    sideOffset={sideOffset}
    {...contentProps}
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
    className={cn(itemClass, className)}
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
    className={cn(itemClass, 'justify-between', className)}
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
    className={cn(itemClass, 'justify-between', className)}
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
    <VegaIcon name={VegaIconNames.TICK} />
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
    className={cn('bg-gs-300 dark:bg-gs-700 mx-2 my-1 h-px', className)}
  />
));

/**
 * Container element for submenus
 */
export const DropdownMenuSub = (
  subProps: ComponentProps<typeof DropdownMenuPrimitive.Sub>
) => <DropdownMenuPrimitive.Sub {...subProps} />;

/**
 * Container within a DropdownMenuSub specifically for the content
 */
export const DropdownMenuSubContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...subContentProps }, forwardedRef) => (
  <DropdownMenuPrimitive.SubContent
    ref={forwardedRef}
    className={cn(
      'p-2 bg-surface-1 text-surface-1-fg rounded border border-gs-300 dark:border-gs-700',
      className
    )}
    {...subContentProps}
  />
));

/**
 * Equivalent to trigger, but for triggering sub menus
 */
export const DropdownMenuSubTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, ...subTriggerProps }, forwardedRef) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(className, itemClass)}
    ref={forwardedRef}
    {...subTriggerProps}
  />
));

/**
 * Portal to ensure menu portions are rendered outwith where they appear in the
 * DOM.
 */
export const DropdownMenuPortal = (
  portalProps: ComponentProps<typeof DropdownMenuPrimitive.Portal>
) => <DropdownMenuPrimitive.Portal {...portalProps} />;

/**
 * Wraps a regular DropdownMenuItem with copy to clip board functionality
 */
export const DropdownMenuCopyItem = ({
  value,
  text,
}: {
  value: string;
  text: string;
}) => {
  const t = useT();
  const [copied, setCopied] = useCopyTimeout();

  return (
    <CopyToClipboard text={value} onCopy={() => setCopied(true)}>
      {/*
      // @ts-ignore Not sure about this typescript error */}
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <VegaIcon name={VegaIconNames.COPY} size={16} />
        {text}
        {copied && (
          <span className="text-xs text-surface-1-fg">{t('Copied')}</span>
        )}
      </DropdownMenuItem>
    </CopyToClipboard>
  );
};
