import * as PopoverPrimitive from '@radix-ui/react-popover';
import { type ComponentPropsWithoutRef } from 'react';

export interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
  children: React.ReactNode;
  open?: boolean;
  sideOffset?: ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Content
  >['sideOffset'];
  alignOffset?: ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Content
  >['alignOffset'];
  align?: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>['align'];
}

export const Popover = ({
  trigger,
  children,
  sideOffset = 17,
  alignOffset = 0,
  align = 'start',
  ...props
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root {...props}>
      <PopoverPrimitive.Trigger data-testid="Settings">
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          align={align}
          className="rounded bg-vega-clight-700 dark:bg-vega-cdark-700 text-default border border-vega-clight-500 dark:border-vega-cdark-500"
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
