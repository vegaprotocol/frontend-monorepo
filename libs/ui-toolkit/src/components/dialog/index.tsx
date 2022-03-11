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
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black/40 dark:bg-white/15" />
        <DialogPrimitives.Content
          className="fixed w-[500px] p-28 dark:bg-black dark:text-white-60 bg-white text-black-60"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {title && <h1 className="text-h5 mb-12">{title}</h1>}
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
