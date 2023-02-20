import styles from './toast.module.css';

import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { HTMLAttributes, HtmlHTMLAttributes } from 'react';
import { forwardRef, useEffect } from 'react';
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
  [Intent.Warning]: IconNames.WARNING_SIGN,
  [Intent.Danger]: IconNames.ERROR,
};

export const CLOSE_DELAY = 500;
export const TICKER = 100;
export const CLOSE_AFTER = 5000;

export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        data-panel
        ref={ref}
        data-testid="toast-panel"
        className={classNames(
          'p-2 rounded mt-[10px]',
          'font-mono text-[12px] leading-[16px] font-normal',
          '[&>h4]:font-bold',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const ToastHeading = forwardRef<
  HTMLHeadingElement,
  HtmlHTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <h3 ref={ref} className="text-sm uppercase mb-1" {...props}>
    {children}
  </h3>
));

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
  }, [id, intent, content]); // DO NOT REMOVE DEPS: intent, content

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
        'w-[320px] rounded-md overflow-hidden',
        'shadow-[8px_8px_16px_0_rgba(0,0,0,0.4)]',
        'text-black dark:text-white',
        'font-alpha liga-0-calt-0 text-[14px] leading-[19px]',
        // background
        {
          'bg-vega-light-100 dark:bg-vega-dark-100 ': intent === Intent.None,
          'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Primary,
          'bg-vega-green-300 dark:bg-vega-green-700': intent === Intent.Success,
          'bg-vega-orange-300 dark:bg-vega-orange-700':
            intent === Intent.Warning,
          'bg-vega-pink-300 dark:bg-vega-pink-700': intent === Intent.Danger,
        },
        // panel's colours
        {
          '[&_[data-panel]]:bg-vega-light-150 [&_[data-panel]]:dark:bg-vega-dark-150 ':
            intent === Intent.None,
          '[&_[data-panel]]:bg-vega-blue-350 [&_[data-panel]]:dark:bg-vega-blue-650':
            intent === Intent.Primary,
          '[&_[data-panel]]:bg-vega-green-350 [&_[data-panel]]:dark:bg-vega-green-650':
            intent === Intent.Success,
          '[&_[data-panel]]:bg-vega-orange-350 [&_[data-panel]]:dark:bg-vega-orange-650':
            intent === Intent.Warning,
          '[&_[data-panel]]:bg-vega-pink-350 [&_[data-panel]]:dark:bg-vega-pink-650':
            intent === Intent.Danger,
        },
        // panels's progress bar colours
        '[&_[data-progress-bar]]:mt-[10px] [&_[data-progress-bar]]:mb-[4px]',
        {
          '[&_[data-progress-bar]]:bg-vega-light-200 [&_[data-progress-bar]]:dark:bg-vega-dark-200 ':
            intent === Intent.None,
          '[&_[data-progress-bar]]:bg-vega-blue-400 [&_[data-progress-bar]]:dark:bg-vega-blue-600':
            intent === Intent.Primary,
          '[&_[data-progress-bar-value]]:bg-vega-blue-500 [&_[data-progress-bar-value]]:dark:bg-vega-blue-500':
            intent === Intent.Primary,
          '[&_[data-progress-bar]]:bg-vega-green-400 [&_[data-progress-bar]]:dark:bg-vega-green-600':
            intent === Intent.Success,
          '[&_[data-progress-bar-value]]:bg-vega-green-600 [&_[data-progress-bar-value]]:dark:bg-vega-green-500':
            intent === Intent.Success,
          '[&_[data-progress-bar]]:bg-vega-orange-400 [&_[data-progress-bar]]:dark:bg-vega-orange-600':
            intent === Intent.Warning,
          '[&_[data-progress-bar-value]]:bg-vega-orange-500 [&_[data-progress-bar-value]]:dark:bg-vega-orange-500':
            intent === Intent.Warning,
          '[&_[data-progress-bar]]:bg-vega-pink-400 [&_[data-progress-bar]]:dark:bg-vega-pink-600':
            intent === Intent.Danger,
          '[&_[data-progress-bar-value]]:bg-vega-pink-500 [&_[data-progress-bar-value]]:dark:bg-vega-pink-500':
            intent === Intent.Danger,
        },
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
          className="absolute p-[8px] top-[3px] right-[3px] z-20"
        >
          <Icon
            name="cross"
            size={3}
            className="!block dark:text-white !w-[11px] !h-[11px]"
          />
        </button>
        <div
          data-testid="toast-accent"
          className={classNames(
            {
              // gray
              'bg-vega-light-200 dark:bg-vega-dark-200 text-vega-light-400 dark:text-vega-dark-100':
                intent === Intent.None,
              // blue
              'bg-vega-blue-500 text-vega-blue-600': intent === Intent.Primary,
              // green
              'bg-vega-green-500 text-vega-green-600':
                intent === Intent.Success,
              // orange
              'bg-vega-orange-500 text-vega-orange-600':
                intent === Intent.Warning,
              // pink
              'bg-vega-pink-500 text-vega-pink-600': intent === Intent.Danger,
            },
            'w-8 p-[9px]',
            'flex justify-center'
          )}
        >
          {loader ? (
            <div className="w-[15px] h-[15px]">
              <Loader size="small" forceTheme="dark" />
            </div>
          ) : (
            <Icon
              name={toastIconMapping[intent]}
              size={4}
              className="!block !w-[14px] !h-[14px]"
            />
          )}
        </div>
        <div
          className={classNames(
            'relative',
            'overflow-auto flex-1 p-4 pr-[40px] [&>p]:mb-[2.5px]'
          )}
          data-testid="toast-content"
        >
          {content}
          {withProgress && (
            <div
              ref={progressRef}
              data-testid="toast-progress-bar"
              className={classNames(
                {
                  'bg-vega-light-200 dark:bg-vega-dark-200 ':
                    intent === Intent.None,
                  'bg-vega-blue-400 dark:bg-vega-blue-600':
                    intent === Intent.Primary,
                  'bg-vega-green-400 dark:bg-vega-green-600':
                    intent === Intent.Success,
                  'bg-vega-orange-400 dark:bg-vega-orange-600':
                    intent === Intent.Warning,
                  'bg-vega-pink-400 dark:bg-vega-pink-600':
                    intent === Intent.Danger,
                },
                'absolute bottom-0 left-0 w-full h-[4px]',
                'animate-progress'
              )}
              style={{
                animationDuration: `${closeAfter}ms`,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};
