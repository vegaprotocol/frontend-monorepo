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
  titleClassNames?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Dialog({
  children,
  open,
  onChange,
  title,
  icon,
  intent,
  titleClassNames,
  size = 'medium',
}: DialogProps) {
  const wrapperClasses = classNames(
    'relative py-24 max-h-[100%] overflow-y-scroll',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black dark:text-white-95 bg-white text-black-95',
    getIntentShadow(intent),
    getIntentBorder(intent),
    {
      'lg:w-[620px] w-full': size === 'small',
      'w-full w-full md:w-[720px] lg:w-[940px]': size === 'medium',
      'left-[0px] top-[99px] h-[calc(100%-99px)] border-0 translate-x-[0] translate-y-[0] border-none overflow-y-auto':
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
        <DialogPrimitives.Content className="fixed top-0 left-0 z-20 w-full h-full flex items-center justify-center">
          <div className={wrapperClasses}>
            <DialogPrimitives.Close
              className="p-2 absolute top-8 right-8 leading-[0] focus:outline-none focus-visible:outline-none focus-visible:border focus-visible:border-vega-yellow focus-visible:top-[7px] focus-visible:right-[7px]"
              data-testid="dialog-close"
            >
              <Icon
                name="cross"
                className="focus:outline-none focus-visible:outline-none"
              />
            </DialogPrimitives.Close>
            <div className="flex p-12 max-w-full overflow-x-scroll">
              {icon && <div className="pt-8 fill-current">{icon}</div>}
              <div data-testid="dialog-content" className="flex-1">
                {title && (
                  <h1
                    className={`text-h4 font-bold text-black-95 dark:text-white-95 mt-0 mb-6 ${titleClassNames}`}
                    data-testid="dialog-title"
                  >
                    {title}
                  </h1>
                )}
                <div className="text-black-60 dark:text-white-60">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
