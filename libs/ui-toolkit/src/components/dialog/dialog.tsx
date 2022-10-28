import { useEffect } from 'react';
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
  onCloseAutoFocus?: (e: Event) => void;
  title?: string;
  icon?: ReactNode;
  intent?: Intent;
  size?: 'small' | 'medium';
}

export function Dialog({
  children,
  open,
  onChange,
  onCloseAutoFocus,
  title,
  icon,
  intent,
  size = 'small',
}: DialogProps) {
  const contentClasses = classNames(
    'fixed top-0 left-0 z-20 flex justify-center items-start overflow-auto',
    'w-full h-full'
  );
  const wrapperClasses = classNames(
    // Positions the modal in the center of screen
    'z-20 relative rounded top-[10vh] max-w-[90vw]',
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

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [open]);

  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 bg-black/50 z-10"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={contentClasses}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div className={wrapperClasses}>
            {onChange && (
              <DialogPrimitives.Close
                className="absolute p-2 top-0 right-0 md:top-2 md:right-2"
                data-testid="dialog-close"
              >
                <Icon name="cross" />
              </DialogPrimitives.Close>
            )}
            <div className="flex gap-4 max-w-full">
              {icon && <div className="fill-current">{icon}</div>}
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
