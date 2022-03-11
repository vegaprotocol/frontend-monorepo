import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { Icon } from '../icon';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  title?: string;
}

export function Dialog({ children, open, setOpen, title }: DialogProps) {
  const contentClasses = classNames(
    'fixed w-[520px] top-[60px] p-28 left-[calc(50%-260px)]',
    'dark:bg-black dark:text-white-95 bg-white text-black-60',
    'shadow-callout shadow-black dark:shadow-white'
  );
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => setOpen(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black dark:bg-white opacity-40 dark:opacity-15" />
        <DialogPrimitives.Content className={contentClasses}>
          <DialogPrimitives.Close className="p-12 absolute top-0 right-0">
            <Icon name="cross" />
          </DialogPrimitives.Close>
          {title && <h1 className="text-h5 mb-12">{title}</h1>}
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
