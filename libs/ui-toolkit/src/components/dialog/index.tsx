import * as DialogPrimitives from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  title?: string;
}

export function Dialog({ children, open, setOpen, title }: DialogProps) {
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => setOpen(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black opacity-20" />
        <DialogPrimitives.Content className="fixed w-[500px] bg-white top-40 p-28 left-[calc(50%-250px)]">
          {title && <h1 className="text-h5 mb-12">{title}</h1>}
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
