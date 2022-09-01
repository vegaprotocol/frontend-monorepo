import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';

import { getIntentBorder } from '../../utils/intent';
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
  size?: 'small' | 'medium';
}

export function Dialog({
  children,
  open,
  onChange,
  title,
  icon,
  intent,
  size = 'small',
}: DialogProps) {
  const wrapperClasses = classNames(
    // Positions the modal in the center of screen
    'z-20 fixed rounded relative top-[10vh] max-w-[90vw] overflow-y-auto',
    // Dimensions
    'max-w-[90vw] p-4 md:p-8',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black bg-white dark:text-white',
    getIntentBorder(intent),
    {
      'w-[620px]': size === 'small',
      'w-[720px] lg:w-[940px]': size === 'medium',
    }
  );

  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 bg-black/50 z-10"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content className="fixed top-0 left-0 z-20 w-full h-full flex items-center justify-center">
          <div className={wrapperClasses}>
            <DialogPrimitives.Close
              className="absolute p-2 top-0 right-0 md:top-2 md:right-2"
              data-testid="dialog-close"
            >
              <Icon name="cross" />
            </DialogPrimitives.Close>
            <div className="flex gap-4 max-w-full">
              {icon && <div className="pt-2 fill-current">{icon}</div>}
              <div data-testid="dialog-content" className="flex-1">
                {title && (
                  <h1
                    className="text-xl uppercase mb-4 pr-2"
                    data-testid="dialog-title"
                  >
                    {title}
                  </h1>
                )}
                <div>{children}</div>
              </div>
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
