import * as PopoverPrimitive from '@radix-ui/react-popover';
import classNames from 'classnames';
import { getIntentBorder } from '../../utils/intent';
import type { Intent } from '../../utils/intent';

export interface PopoverProps extends PopoverPrimitive.PopoverProps {
  trigger: React.ReactNode | string;
  children: React.ReactNode;
  open?: boolean;
  onChange?: (open: boolean) => void;
  intent?: Intent;
}

export const Popover = ({
  trigger,
  children,
  open,
  onChange,
  intent,
}: PopoverProps) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <PopoverPrimitive.Trigger
        data-testid="popover-trigger"
        className={classNames(
          getIntentBorder(intent),
          'border-none',
          'ease-in-out duration-200'
        )}
      >
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="popover-content"
          className={classNames(
            ' w-[100vw] h-full ',
            getIntentBorder(intent),
            'dark:bg-black bg-white',
            {
              'border-2': open,
              'border-none': !open,
            },
            'ease-in-out duration-75'
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
