import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';

import { getIntentBorder } from '../../utils/intent';
import { VegaIcon, VegaIconNames } from '../icon';

import type { ReactNode } from 'react';
import type { Intent } from '../../utils/intent';
interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
  title?: string | ReactNode;
  icon?: ReactNode;
  intent?: Intent;
  size?: 'small' | 'medium' | 'large';
  dataTestId?: string;
}

export function Dialog({
  children,
  open,
  onChange,
  onCloseAutoFocus,
  onInteractOutside,
  title,
  icon,
  intent,
  size = 'small',
  dataTestId = 'dialog-content',
}: DialogProps) {
  const contentClasses = classNames(
    'fixed top-0 left-0 z-20 flex justify-center items-start overflow-auto',
    'w-full h-full'
  );
  const wrapperClasses = classNames(
    // Dimensions
    'max-w-[95vw] sm:max-w-[90vw] p-4 md:p-8 rounded-lg',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black bg-white dark:text-white',
    getIntentBorder(intent),
    {
      'w-[520px]': size === 'small',
      'sm:w-[680px]': size === 'medium',
      'sm:w-[720px] lg:w-[940px]': size === 'large',
    }
  );

  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange?.(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 dark:bg-black/80 bg-black/50 z-20"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={contentClasses}
          onCloseAutoFocus={onCloseAutoFocus}
          onInteractOutside={onInteractOutside}
          data-testid={dataTestId}
        >
          <div
            className={classNames(
              // Positions the modal in the center of screen
              'z-20 relative rounded top-[5vw] lg:top-[10vw] pb-3'
            )}
          >
            <div className={wrapperClasses}>
              {onChange && (
                <DialogPrimitives.Close
                  className="absolute p-2 top-0 right-0 md:top-2 md:right-2"
                  data-testid="dialog-close"
                >
                  <VegaIcon name={VegaIconNames.CROSS} size={24} />
                </DialogPrimitives.Close>
              )}
              <div
                data-testid="dialog-content"
                className="flex flex-col gap-2 flex-1 max-w-full"
              >
                {title && (
                  <h3 className="text-xl flex gap-4" data-testid="dialog-title">
                    {icon && (
                      <span className="fill-current flex items-center">
                        {icon}
                      </span>
                    )}
                    {title}
                  </h3>
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
