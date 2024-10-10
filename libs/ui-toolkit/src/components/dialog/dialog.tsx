import * as DialogPrimitives from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

import { getIntentBorder } from '../../utils/intent';
import { VegaIcon, VegaIconNames } from '../icon';

import {
  forwardRef,
  type ElementRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Intent } from '../../utils/intent';
interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
  description?: string;
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
  intent = Intent.None,
  size = 'small',
  dataTestId = 'dialog-content',
  description,
}: DialogProps) {
  const contentClasses = cn(
    'fixed top-0 left-0 z-20 flex justify-center items-start overflow-auto',
    'w-full h-full'
  );
  const wrapperClasses = cn(
    // Dimensions
    'max-w-[95vw] sm:max-w-[90vw] p-4 md:p-8 rounded-lg',
    // Need to apply background and text colors again as content is rendered in a portal
    'bg-surface-0 text-surface-0-fg',
    'border',
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
          className="fixed inset-0 bg-surface-0/80 z-20"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={contentClasses}
          onCloseAutoFocus={onCloseAutoFocus}
          onInteractOutside={onInteractOutside}
          data-testid={dataTestId}
          aria-describedby={description}
        >
          {description && (
            <DialogPrimitives.Description className="sr-only">
              {description}
            </DialogPrimitives.Description>
          )}
          <div
            className={cn(
              // Positions the modal in the center of screen
              'z-20 relative rounded top-[5vw] pb-3'
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
                  <DialogTitle
                    icon={
                      icon && (
                        <span className="fill-current flex items-center">
                          {icon}
                        </span>
                      )
                    }
                  >
                    {title}
                  </DialogTitle>
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

type DialogTitleProps = ComponentProps<typeof DialogPrimitives.Title> & {
  icon?: ReactNode;
};

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitives.Title>,
  DialogTitleProps
>((props, ref) => {
  return (
    <DialogPrimitives.Title
      data-testid="dialog-title"
      {...props}
      className={cn('text-xl flex gap-4', props.className)}
      ref={ref}
    >
      {props.icon && (
        <span className="fill-current flex items-center">{props.icon}</span>
      )}
      {props.children}
    </DialogPrimitives.Title>
  );
});
