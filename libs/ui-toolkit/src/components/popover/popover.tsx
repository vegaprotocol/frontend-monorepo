import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useRef } from 'react';
import { Icon } from '../icon';

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
  const popoverContent = useRef<HTMLDivElement>(null);
  /**
   * It's responsible for preventing auto-closing of the popover when
   * `focusOutside` event is originated from within (e.g. opens dialog)
   */
  const focusLock = useRef<boolean>(false);
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <PopoverPrimitive.Trigger data-testid="popover-trigger">
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          align="start"
          className="p-4 rounded bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-400"
          sideOffset={10}
          ref={popoverContent}
          onFocus={() => (focusLock.current = false)}
          onInteractOutside={(e) => {
            const origin = e.detail.originalEvent.relatedTarget as Element;
            if (
              origin &&
              origin.hasAttribute('data-dialog-trigger') &&
              popoverContent.current?.contains(origin)
            ) {
              focusLock.current = true;
            }
            if (focusLock.current) e.preventDefault();
          }}
        >
          <PopoverPrimitive.Close
            className="px-4 py-2 absolute top-0 right-0 z-20"
            data-testid="dialog-close"
          >
            <Icon name="cross" />
          </PopoverPrimitive.Close>
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
