import * as PopoverPrimitive from '@radix-ui/react-popover';

export interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
  children: React.ReactNode;
  open?: boolean;
  onChange?: (open: boolean) => void;
  sideOffset?: number;
  alignOffset?: number;
}

export const Popover = ({
  trigger,
  children,
  open,
  onChange,
  sideOffset = 17,
  alignOffset = 0,
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <PopoverPrimitive.Trigger data-testid="popover-trigger">
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          align="start"
          className="rounded bg-vega-clight-800 dark:bg-vega-cdark-800 text-default border border-default"
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
