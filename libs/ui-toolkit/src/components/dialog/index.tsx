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
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black opacity-20" />
        <DialogPrimitives.Content className="fixed w-[300px] bg-white top-40 p-12 left-[calc(50%-150px)]">
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
