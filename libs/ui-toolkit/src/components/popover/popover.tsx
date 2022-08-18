import * as PopoverPrimitive from '@radix-ui/react-popover';

export interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
  children: React.ReactNode;
  open?: boolean;
  onChange?: (open: boolean) => void;
}

export const Popover = ({
  trigger,
  children,
  open,
  onChange,
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
          className="p-4 rounded bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
          sideOffset={10}
        >
          <PopoverPrimitive.Close
            className="p-2 absolute top-8 right-8 leading-[0] focus:outline-none focus-visible:outline-none focus-visible:border focus-visible:border-vega-yellow focus-visible:top-[7px] focus-visible:right-[7px] text-black dark:text-white"
            data-testid="dialog-close"
          >
            <Icon
              name="cross"
              className="focus:outline-none focus-visible:outline-none"
            />
          </PopoverPrimitive.Close>
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
