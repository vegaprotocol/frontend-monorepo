import { t } from '@vegaprotocol/i18n';
import { usePrevious } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import type { Ref } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Button } from '../button';
import { Toast } from './toast';
import type { Toasts } from './use-toasts';
import { ToastPosition, useToasts, useToastsConfiguration } from './use-toasts';

import { Portal } from '@radix-ui/react-portal';

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
  const ref = useRef<HTMLDivElement>();
  const closeAll = useToasts((store) => store.closeAll);
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
      className={classNames(
        'group',
        'absolute z-20',
        { 'bottom-0 right-0': position === ToastPosition.BottomRight },
        { 'bottom-0 left-0': position === ToastPosition.BottomLeft },
        { 'top-0 left-0': position === ToastPosition.TopLeft },
        { 'top-0 right-0': position === ToastPosition.TopRight },
        {
          'top-0 left-[50%] translate-x-[-50%]':
            position === ToastPosition.TopCenter,
        },
        {
          'bottom-0 left-[50%] translate-x-[-50%]':
            position === ToastPosition.BottomCenter,
        },
        'p-[8px_16px_16px_16px]',
        'max-w-full max-h-full overflow-x-hidden overflow-y-auto',
        {
          hidden: Object.keys(toasts).length === 0,
        }
      )}
    >
      <ul
        className={classNames('relative mt-[38px]', 'flex flex-col gap-[8px]', {
          'flex-col-reverse': order === 'desc',
        })}
      >
        {validToasts.length > 0 &&
          validToasts
            .filter((t) => !t.hidden || showHidden)
            .map((toast) => {
              return (
                <li key={toast.id}>
                  <Toast {...toast} />
                </li>
              );
            })}
        <Button
          title={t('Dismiss all toasts')}
          size="sm"
          fill={true}
          className={classNames(
            'absolute top-[-38px] right-0 z-20',
            'transition-opacity',
            'opacity-0 group-hover:opacity-50 hover:!opacity-100',
            'text-sm text-black dark:text-white bg-white dark:bg-black hover:!bg-white hover:dark:!bg-black',
            {
              hidden: validToasts.length === 0,
            }
          )}
          onClick={() => {
            closeAll();
          }}
          variant={'default'}
        >
          {t('Dismiss all')}
        </Button>
      </ul>
    </Portal>
  );
};
