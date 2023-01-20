import styles from './toast.module.css';

import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useLayoutEffect } from 'react';
import { useRef } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';
import { Loader } from '../loader';

export type ToastContent = JSX.Element | undefined;

type ToastState = 'initial' | 'showing' | 'expired';

export type Toast = {
  id: string;
  intent: Intent;
  content: ToastContent;
  closeAfter?: number;
  onClose?: () => void;
  signal?: 'close';
  loader?: boolean;
};

type ToastProps = Toast & {
  state?: ToastState;
};

const toastIconMapping: { [i in Intent]: IconName } = {
  [Intent.None]: IconNames.HELP,
  [Intent.Primary]: IconNames.INFO_SIGN,
  [Intent.Success]: IconNames.TICK_CIRCLE,
  [Intent.Warning]: IconNames.ERROR,
  [Intent.Danger]: IconNames.ERROR,
};

const getToastAccent = (intent: Intent) => ({
  // strip
  'bg-gray-200 text-black text-opacity-70': intent === Intent.None,
  'bg-vega-blue text-white text-opacity-70': intent === Intent.Primary,
  'bg-success text-white text-opacity-70': intent === Intent.Success,
  'bg-warning text-white text-opacity-70': intent === Intent.Warning,
  'bg-vega-pink text-white text-opacity-70': intent === Intent.Danger,
});

export const CLOSE_DELAY = 750;

export const Toast = ({
  id,
  intent,
  content,
  closeAfter,
  signal,
  state = 'initial',
  onClose,
  loader = false,
}: ToastProps) => {
  const toastRef = useRef<HTMLDivElement>(null);

  const closeToast = useCallback(() => {
    requestAnimationFrame(() => {
      if (toastRef.current?.classList.contains(styles['showing'])) {
        toastRef.current.classList.remove(styles['showing']);
        toastRef.current.classList.add(styles['expired']);
      }
    });
    setTimeout(() => {
      onClose?.();
    }, CLOSE_DELAY);
  }, [onClose]);

  useLayoutEffect(() => {
    const req = requestAnimationFrame(() => {
      if (toastRef.current?.classList.contains(styles['initial'])) {
        toastRef.current.classList.remove(styles['initial']);
        toastRef.current.classList.add(styles['showing']);
      }
    });
    return () => cancelAnimationFrame(req);
  }, [id]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (closeAfter && closeAfter > 0) {
      t = setTimeout(() => {
        closeToast();
      }, closeAfter);
    }
    return () => clearTimeout(t);
  }, [closeAfter, closeToast]);

  useEffect(() => {
    if (signal === 'close') {
      closeToast();
    }
  }, [closeToast, signal]);

  return (
    <div
      data-testid="toast"
      data-toast-id={id}
      ref={toastRef}
      className={classNames(
        'relative w-[300px] top-0 rounded-md border overflow-hidden mb-2',
        'text-black bg-white dark:border-zinc-700',
        {
          [styles['initial']]: state === 'initial',
          [styles['showing']]: state === 'showing',
          [styles['expired']]: state === 'expired',
        }
      )}
    >
      <div className="flex relative">
        <button
          data-testid="toast-close"
          onClick={closeToast}
          className="absolute p-2 top-0 right-0"
        >
          <Icon name="cross" size={3} className="!block" />
        </button>
        <div
          className={classNames(getToastAccent(intent), 'p-2 pt-3 text-center')}
        >
          {loader ? (
            <div className="w-4 h-4">
              <Loader size="small" forceTheme="dark" />
            </div>
          ) : (
            <Icon name={toastIconMapping[intent]} size={4} className="!block" />
          )}
        </div>
        <div
          className="flex-1 p-2 pr-6 text-sm overflow-auto dark:bg-black dark:text-white"
          data-testid="toast-content"
        >
          {content}
        </div>
      </div>
    </div>
  );
};
