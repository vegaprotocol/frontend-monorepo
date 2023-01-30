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
export const TICKER = 100;
export const CLOSE_AFTER = 5000;

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
  const progressRef = useRef<HTMLDivElement>(null);
  const ticker = useRef<number>(0);
  const lock = useRef<boolean>(false);

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
    const i = setInterval(() => {
      if (!closeAfter || closeAfter === 0) return;
      if (!lock.current) {
        ticker.current += 100;
      }
      if (ticker.current >= closeAfter) {
        closeToast();
      }
    }, 100);
    return () => {
      clearInterval(i);
    };
  }, [closeAfter, closeToast]);

  useEffect(() => {
    if (signal === 'close') {
      closeToast();
    }
  }, [closeToast, signal]);

  const withProgress = Boolean(closeAfter && closeAfter > 0);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      data-testid="toast"
      data-toast-id={id}
      ref={toastRef}
      role="dialog"
      onMouseLeave={() => {
        lock.current = false;
        if (progressRef.current) {
          progressRef.current.style.animationPlayState = 'running';
        }
      }}
      onMouseEnter={() => {
        lock.current = true;
        if (progressRef.current) {
          progressRef.current.style.animationPlayState = 'paused';
        }
      }}
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
          type="button"
          data-testid="toast-close"
          onClick={closeToast}
          className="absolute p-2 top-0 right-0"
        >
          <Icon name="cross" size={3} className="!block dark:text-white" />
        </button>
        <div
          className={classNames(
            getToastAccent(intent),
            'w-8',
            'p-2 pt-3 text-center relative'
          )}
        >
          {withProgress && (
            <div
              ref={progressRef}
              className={classNames(
                'absolute top-0 left-0 w-full h-full',
                'animate-vertical-progress',
                'bg-white/30 backdrop-saturate-125'
              )}
              style={{
                animationDuration: `${closeAfter}ms`,
              }}
            ></div>
          )}
          <div className="absolute">
            {loader ? (
              <div className="w-4 h-4">
                <Loader size="small" forceTheme="dark" />
              </div>
            ) : (
              <Icon
                name={toastIconMapping[intent]}
                size={4}
                className="!block"
              />
            )}
          </div>
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
