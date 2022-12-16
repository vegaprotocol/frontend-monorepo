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
        'absolute top-0 right-0 pt-2 pr-2 max-w-full z-20 max-h-full overflow-auto',
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
