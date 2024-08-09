import { usePrevious } from '@vegaprotocol/react-helpers';
import { cn } from '@vegaprotocol/utils';
import type { Ref } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Button } from '../button';
import { Toast } from './toast';
import type { Toasts } from './use-toasts';
import { ToastPosition, useToasts, useToastsConfiguration } from './use-toasts';

import { Portal } from '@radix-ui/react-portal';
import { useT } from '../../use-t';

type ToastsContainerProps = {
  toasts: Toasts;
  order: 'asc' | 'desc';
  showHidden?: boolean;
};

export const ToastsContainer = ({
  toasts,
  order = 'asc',
  showHidden = false,
}: ToastsContainerProps) => {
  const t = useT();
  const ref = useRef<HTMLDivElement>();
  const closeAll = useToasts((store) => store.closeAll);
  const remove = useToasts((store) => store.remove);
  const position = useToastsConfiguration((store) => store.position);
  // Scroll to top for desc, bottom for asc when a toast is added.
  const count = usePrevious(Object.keys(toasts).length) || 0;
  useLayoutEffect(() => {
    const t = setTimeout(
      () => {
        if (Object.keys(toasts).length > count) {
          ref.current?.scrollTo({
            top: order === 'desc' ? 0 : ref.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      },
      300 // need to delay scroll down in order for the toast to appear
    );
    return () => {
      clearTimeout(t);
    };
  }, [count, order, toasts]);

  const validToasts = Object.values(toasts).filter(
    (t) => !t.hidden || showHidden
  );

  return (
    <Portal
      ref={ref as Ref<HTMLDivElement>}
      className={cn(
        'group absolute z-30 pointer-events-auto',
        { 'bottom-0 right-0': position === ToastPosition.BottomRight },
        { 'bottom-0 left-0': position === ToastPosition.BottomLeft },
        { 'left-0 top-0': position === ToastPosition.TopLeft },
        { 'right-0 top-0': position === ToastPosition.TopRight },
        {
          'left-[50%] top-0 translate-x-[-50%]':
            position === ToastPosition.TopCenter,
        },
        {
          'bottom-0 left-[50%] translate-x-[-50%]':
            position === ToastPosition.BottomCenter,
        },
        'max-h-full max-w-full overflow-y-auto overflow-x-hidden',
        {
          'p-4': validToasts.length > 0, // only apply padding when toasts showing, otherwise a small section of the screen is covered
          hidden: validToasts.length === 0,
        }
      )}
    >
      <ul
        className={cn('relative mt-[38px]', 'flex flex-col gap-[8px]', {
          'flex-col-reverse': order === 'desc',
        })}
      >
        {validToasts.length > 0 &&
          validToasts
            .filter((t) => !t.hidden || showHidden)
            .map((toast) => {
              return (
                <li key={toast.id}>
                  <Toast
                    // by default remove the toast when closed
                    onClose={() => remove(toast.id)}
                    {...toast}
                  />
                </li>
              );
            })}
        <div
          className={cn(
            'absolute right-0 top-[-38px] z-20 w-full',
            'transition-opacity',
            'sm:opacity-0 sm:hover:!opacity-100 sm:group-hover:opacity-50',
            {
              hidden: validToasts.length === 0,
            }
          )}
        >
          <Button
            title={t('Dismiss all toasts')}
            size="sm"
            fill={true}
            onClick={() => {
              closeAll();
            }}
          >
            {t('Dismiss all')}
          </Button>
        </div>
      </ul>
    </Portal>
  );
};
