import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { getIntentShadow, Intent } from '../../utils/intent';
import { Icon } from '../icon';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  title?: string;
  intent?: Intent;
}

export function Dialog({
  children,
  open,
  setOpen,
  title,
  intent,
}: DialogProps) {
  const contentClasses = classNames(
    'fixed w-[520px] p-28 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
    'dark:bg-black dark:text-white-60 bg-white text-black-60',
    getIntentShadow(intent)
  );
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => setOpen(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black/50 dark:bg-white/15" />
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
