import * as PopoverPrimitive from '@radix-ui/react-popover';
import { VegaIcon, VegaIconNames } from '../icon';

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
          className="rounded bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-400"
          sideOffset={10}
        >
          <PopoverPrimitive.Close
            className="px-4 py-2 absolute top-0 right-0 z-20"
            data-testid="dialog-close"
          >
            <VegaIcon name={VegaIconNames.CROSS} />
          </PopoverPrimitive.Close>
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
