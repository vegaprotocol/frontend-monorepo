import { t, usePrevious } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';
import { tr } from 'date-fns/locale';
import type { Ref } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Button } from '../button';
import { Toast } from './toast';
import type { Toasts } from './use-toasts';
import { useToasts } from './use-toasts';

type ToastsContainerProps = {
  toasts: Toasts;
  order: 'asc' | 'desc';
};

export const ToastsContainer = ({
  toasts,
  order = 'asc',
}: ToastsContainerProps) => {
  const ref = useRef<HTMLDivElement>();
  const closeAll = useToasts((store) => store.closeAll);

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

  return (
    <div
      ref={ref as Ref<HTMLDivElement>}
      className={classNames(
        'group',
        'absolute top-0 right-0 pt-2 pr-2 max-w-full z-20 max-h-full overflow-x-hidden overflow-y-auto',
        {
          hidden: Object.keys(toasts).length === 0,
        }
      )}
    >
      <ul
        className={classNames('relative mt-[26px]', {
          'flex flex-col-reverse': order === 'desc',
        })}
      >
        {toasts &&
          Object.values(toasts).map((toast) => {
            return (
              <li key={toast.id}>
                <Toast {...toast} />
              </li>
            );
          })}
        <Button
          title={t('Close all toasts')}
          size={'xs'}
          fill={false}
          className={classNames(
            'absolute top-[-26px] right-0 z-20',
            'transition-opacity',
            'opacity-0 group-hover:opacity-50 hover:!opacity-100',
            'text-xs'
          )}
          onClick={() => {
            closeAll();
          }}
          variant={'default'}
        >
          {t('Close all')}
        </Button>
      </ul>
    </div>
  );
};
