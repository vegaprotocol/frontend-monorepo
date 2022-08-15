import * as ToastPrimitive from '@radix-ui/react-toast';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { getIntentBorder, getIntentShadow } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export interface ToastProps extends ToastPrimitive.ToastProps {
  children?: ReactNode;
  actions?: ReactNode;
  altText?: string;
  icon?: ReactNode;
  intent: Intent;
}

export const Toast = ({
  title,
  actions,
  intent,
  children,
  icon,
  altText = 'toast',
  ...props
}: ToastProps) => {
  const contentClasses = classNames(
    'relative bg-white dark:bg-black px-28 py-24 max-w-[390px]',
    // // Need to apply background and text colors again as content is rendered in a portal
    // 'dark:bg-black dark:text-white-95 bg-white text-black-95',
    getIntentShadow(intent),
    getIntentBorder(intent)
  );
  const timerRef = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastPrimitive.ToastProvider swipeDirection="right">
      <ToastPrimitive.Root duration={100000} className="grid" {...props}>
        <ToastPrimitive.Description className={contentClasses}>
          <div className="flex gap-12 max-w-full">
            {icon && <div className="pt-8 fill-current">{icon}</div>}
            <div data-testid="toast-content" className="flex-1">
              {title && (
                <ToastPrimitive.Title
                  className={`text-ui font-bold text-black-95 dark:text-white-95 mt-0 mb-2`}
                  data-testid="toast-title"
                >
                  {title}
                </ToastPrimitive.Title>
              )}
              <div className="text-black-60 dark:text-white-60">{children}</div>
            </div>
          </div>
          <ToastPrimitive.Close
            className="p-2 absolute top-8 right-8 leading-[0] focus:outline-none focus-visible:outline-none focus-visible:border focus-visible:border-vega-yellow focus-visible:top-[7px] focus-visible:right-[7px]"
            data-testid="toast-close"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </ToastPrimitive.Close>
        </ToastPrimitive.Description>
        {actions && (
          <ToastPrimitive.Action asChild altText={altText}>
            {actions}
          </ToastPrimitive.Action>
        )}
      </ToastPrimitive.Root>
      <ToastPrimitive.ToastViewport className="z-20 fixed top-[3rem] right-16 flex flex-col p-25 gap-10 m-0" />
    </ToastPrimitive.ToastProvider>
  );
};
