import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';

import { getIntentBorder, getIntentShadow } from '../../utils/intent';
import { Icon } from '../icon';

import type { ReactNode } from 'react';
import type { Intent } from '../../utils/intent';
interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  title?: string;
  icon?: ReactNode;
  intent?: Intent;
  size?: 'small' | 'medium' | 'large';
}

export function Dialog({
  children,
  open,
  onChange,
  title,
  icon,
  intent,
  size = 'medium',
}: DialogProps) {
  const contentClasses = classNames(
    // Positions the modal in the center of screen
    'z-20 fixed p-8 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] dark:text-white',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black bg-white',
    getIntentShadow(intent),
    getIntentBorder(intent),
    {
      'lg:w-[620px] w-full': size === 'small',
      'w-full w-full md:w-[720px] lg:w-[940px]': size === 'medium',
      'left-[0px] top-[99px] h-[calc(100%-99px)] border-0 translate-x-[0] translate-y-[0] border-none overflow-y-auto w-full':
        size === 'large',
    }
  );
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 bg-black/50 z-10"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content className={contentClasses}>
          <DialogPrimitives.Close
            className="p-2 absolute top-2 right-2"
            data-testid="dialog-close"
          >
            <Icon name="cross" />
          </DialogPrimitives.Close>
          <div className="flex gap-4 max-w-full">
            {icon && <div className="pt-2 fill-current">{icon}</div>}
            <div data-testid="dialog-content" className="flex-1">
              {title && (
                <h1
                  className="text-xl uppercase mb-4"
                  data-testid="dialog-title"
                >
                  {title}
                </h1>
              )}
              <div>{children}</div>
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
