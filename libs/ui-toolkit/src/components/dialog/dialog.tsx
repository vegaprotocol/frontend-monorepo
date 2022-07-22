import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { Intent } from '../../utils/intent';
import { getIntentShadow, getIntentBorder } from '../../utils/intent';
import { Icon } from '../icon';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  title?: string;
  icon?: ReactNode;
  intent?: Intent;
  titleClassNames?: string;
  contentClassNames?: string;
}

export function Dialog({
  children,
  open,
  onChange,
  title,
  icon,
  intent,
  titleClassNames,
  contentClassNames,
}: DialogProps) {
  const contentClasses = classNames(
    // Positions the modal in the center of screen
    'z-20 fixed w-full md:w-[720px] lg:w-[940px] px-28 py-24 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black dark:text-white-95 bg-white text-black-95',
    getIntentShadow(intent),
    getIntentBorder(intent),
    contentClassNames
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
            className="p-2 absolute top-8 right-8 leading-[0] focus:outline-none focus-visible:outline-none focus-visible:border focus-visible:border-vega-yellow focus-visible:top-[7px] focus-visible:right-[7px]"
            data-testid="dialog-close"
          >
            <Icon
              name="cross"
              className="focus:outline-none focus-visible:outline-none"
            />
          </DialogPrimitives.Close>
          <div className="flex gap-12 max-w-full">
            {icon && <div className="pt-8 fill-current">{icon}</div>}
            <div data-testid="order-wrapper" className="flex-1">
              {title && (
                <h1
                  className={`text-h4 font-bold text-black-95 dark:text-white-95 mt-0 mb-20 ${titleClassNames}`}
                  data-testid="dialog-title"
                >
                  {title}
                </h1>
              )}
              {children}
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
