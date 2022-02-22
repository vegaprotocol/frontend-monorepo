import * as DialogPrimitives from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function Dialog({ children, open, setOpen }: DialogProps) {
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => setOpen(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay className="bg-gray/75 fixed inset-0" />
        <DialogPrimitives.Content
          style={{ width: 300, top: 40, left: 'calc(50% - 150px)' }}
          className="fixed inset-0"
        >
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
