import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';
import { VegaIcon, VegaIconNames } from '../icon';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import CopyToClipboard from 'react-copy-to-clipboard';
import { t } from '@vegaprotocol/i18n';

const itemClass = classNames(
  'relative flex gap-2 items-center rounded-sm p-2 text-sm',
  'cursor-default hover:cursor-pointer',
  'hover:bg-vega-clight-400 dark:hover:bg-vega-cdark-400',
  'focus:bg-vega-clight-400 dark:focus:bg-vega-cdark-400',
  'select-none',
  'whitespace-nowrap'
);

type TradingDropdownProps = DropdownMenuPrimitive.DropdownMenuProps & {
  trigger: ReactNode;
};

/**
 * Contains all the parts of a dropdown menu.
 */
export const TradingDropdown = ({
  children,
  trigger,
  ...props
}: TradingDropdownProps) => {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      {trigger}
      <DropdownMenuPrimitive.Portal>{children}</DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
/**
 * The button that toggles the dropdown menu.
 * By default, the {@link TradingDropdownContent} will position itself against the trigger.
 */
export const TradingDropdownTrigger = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownMenuPrimitive.DropdownMenuTriggerProps
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Trigger
      asChild={true}
      ref={forwardedRef}
      className={className}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
});
TradingDropdownTrigger.displayName = 'DropdownMenuTrigger';

/**
 * Used to group multiple {@link TradingDropdownRadioItem}s.
 */
export const TradingDropdownRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * The component that pops out when the dropdown menu is open.
 */
export const TradingDropdownContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>
>(
  (
    { className, align = 'start', side, sideOffset = 10, ...contentProps },
    forwardedRef
  ) => (
    <DropdownMenuPrimitive.Content
      ref={forwardedRef}
      className={classNames(
        'bg-vega-clight-700 dark:bg-vega-cdark-700',
        'border-vega-clight-500 dark:border-vega-cdark-500 border',
        'text-default z-20 rounded p-2'
      )}
      align={align}
      sideOffset={sideOffset}
      side={side}
      {...contentProps}
    />
  )
);
TradingDropdownContent.displayName = 'DropdownMenuContent';

/**
 * The component that contains the dropdown menu items.
 */
export const TradingDropdownItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>
>(({ className, ...itemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    {...itemProps}
    ref={forwardedRef}
    className={classNames(itemClass, className)}
  />
));
TradingDropdownItem.displayName = 'DropdownMenuItem';

/**
 * An item that can be controlled and rendered like a checkbox.
 */
export const TradingDropdownCheckboxItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, ...checkboxItemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.CheckboxItem
    {...checkboxItemProps}
    ref={forwardedRef}
    className={classNames(itemClass, 'justify-between', className)}
  />
));
TradingDropdownCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

/**
 * An item that can be controlled and rendered like a radio.
 */
export const TradingDropdownRadioItem = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
    inset?: boolean;
  }
>(({ className, inset = false, ...radioItemProps }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioItem
    {...radioItemProps}
    ref={forwardedRef}
    className={classNames(itemClass, 'justify-between', className)}
  />
));
TradingDropdownRadioItem.displayName = 'DropdownMenuRadioItem';

/**
 * Renders when the parent {@link TradingDropdownCheckboxItem} or {@link TradingDropdownRadioItem} is checked.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export const TradingDropdownItemIndicator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.ItemIndicator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>
>(({ ...itemIndicatorProps }, forwardedRef) => (
  <DropdownMenuPrimitive.ItemIndicator
    {...itemIndicatorProps}
    ref={forwardedRef}
    className="flex-end text-vega-green-600 dark:text-vega-green"
  >
    <VegaIcon name={VegaIconNames.TICK} />
  </DropdownMenuPrimitive.ItemIndicator>
));
TradingDropdownItemIndicator.displayName = 'DropdownMenuItemIndicator';

/**
 * Used to visually separate items in the dropdown menu.
 */
export const TradingDropdownSeparator = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...separatorProps }, forwardedRef) => (
  <DropdownMenuPrimitive.Separator
    {...separatorProps}
    ref={forwardedRef}
    className={classNames(
      'bg-vega-clight-500 dark:bg-vega-cdark-500 mx-2 my-1 h-px',
      className
    )}
  />
));
TradingDropdownSeparator.displayName = 'DropdownMenuSeparator';

/**
 * Portal to ensure menu portions are rendered outwith where they appear in the
 * DOM.
 */
export const TradingDropdownPortal = (
  portalProps: ComponentProps<typeof DropdownMenuPrimitive.Portal>
) => <DropdownMenuPrimitive.Portal {...portalProps} />;

/**
 * Wraps a regular DropdownMenuItem with copy to clip board functionality
 */
export const TradingDropdownCopyItem = ({
  value,
  text,
}: {
  value: string;
  text: string;
}) => {
  const [copied, setCopied] = useCopyTimeout();

  return (
    <CopyToClipboard text={value} onCopy={() => setCopied(true)}>
      {/*
      // @ts-ignore Not sure about this typescript error */}
      <TradingDropdownItem
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <VegaIcon name={VegaIconNames.COPY} size={16} />
        {text}
        {copied && (
          <span className="text-xs text-neutral-500">{t('Copied')}</span>
        )}
      </TradingDropdownItem>
    </CopyToClipboard>
  );
};
