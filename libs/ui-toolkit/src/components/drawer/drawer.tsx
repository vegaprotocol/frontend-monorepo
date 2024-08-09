import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import * as DialogPrimitives from '@radix-ui/react-dialog';
import { Icon } from '../icon';

interface DrawerProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  onCloseAutoFocus?: (e: Event) => void;
  container?: HTMLElement | null;
  dataTestId?: string;
  className?: string;
  showClose?: boolean;
  trigger?: ReactNode;
}

export function Drawer({
  children,
  open,
  onChange,
  onCloseAutoFocus,
  dataTestId = 'drawer-content',
  container,
  className = '',
  showClose,
  trigger,
}: DrawerProps) {
  const contentClasses = cn(
    'group/drawer',
    'h-full max-w-[500px] w-[90vw] z-10 top-0 right-0 fixed transition-transform',
    className,
    {
      'translate-x-[100%]': !open,
      'translate-x-0 z-20': open,
    }
  );

  const overlayClass = cn('inset-0 bg-black/50 z-20', {
    hidden: !open,
    fixed: open,
  });

  return (
    <DialogPrimitives.Root
      open={open}
      onOpenChange={(x) => onChange?.(x)}
      modal={false}
    >
      <DialogPrimitives.Trigger asChild>{trigger}</DialogPrimitives.Trigger>
      <DialogPrimitives.Portal forceMount container={container}>
        <DialogPrimitives.Overlay
          className={overlayClass}
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={contentClasses}
          onCloseAutoFocus={onCloseAutoFocus}
          data-testid={dataTestId}
          forceMount
        >
          {showClose && onChange && (
            <DialogPrimitives.Close
              className="absolute p-2 top-0 right-0 md:top-2 md:right-2"
              data-testid="drawer-close"
            >
              <Icon name="cross" />
            </DialogPrimitives.Close>
          )}
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
