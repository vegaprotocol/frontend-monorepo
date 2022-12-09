import classNames from 'classnames';
import { Toast } from './toast';

type ToastsContainerProps = {
  toasts: Toast[];
  order: 'asc' | 'desc';
};

export const ToastsContainer = ({
  toasts,
  order = 'asc',
}: ToastsContainerProps) => {
  return (
    <ul
      className={classNames(
        'absolute top-2 right-2 overflow-hidden max-w-full',
        {
          'flex flex-col-reverse': order === 'desc',
        }
      )}
    >
      {toasts &&
        toasts.map((toast) => {
          return (
            <li key={toast.id}>
              <Toast {...toast} />
            </li>
          );
        })}
    </ul>
  );
};
