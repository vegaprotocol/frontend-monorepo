import classNames from 'classnames';
import { useCallback } from 'react';
import { Toast } from './toast';
import { useToasts } from './use-toasts';

type ToastsContainerProps = {
  order: 'asc' | 'desc';
};

export const ToastsContainer = ({ order = 'asc' }: ToastsContainerProps) => {
  const { toasts, remove } = useToasts();
  const onClose = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove]
  );

  return (
    <ul
      className={classNames(
        'absolute top-2 right-2 overflow-hidden max-w-full',
        {
          'flex flex-col-reverse': order === 'desc',
        }
      )}
    >
      {toasts.map((toast) => {
        return (
          <li key={toast.id}>
            <Toast onClose={onClose} {...toast} />
          </li>
        );
      })}
    </ul>
  );
};
