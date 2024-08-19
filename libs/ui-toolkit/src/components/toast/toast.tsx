import styles from './toast.module.css';

import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import { cn } from '../../utils/cn';
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  type HTMLAttributes,
  type HtmlHTMLAttributes,
  type ReactNode,
} from 'react';
import { Intent } from '../../utils/intent';
import { Icon, VegaIcon, VegaIconNames } from '../icon';
import { Loader } from '../loader';
import { useT } from '../../use-t';

export type ToastContent = JSX.Element | undefined;

type ToastState = 'initial' | 'showing' | 'expired';

type WithdrawalInfoMeta = { withdrawalId: string | undefined };

export type Toast = {
  id: string;
  intent: Intent;
  content: ToastContent;
  closeAfter?: number;
  onClose?: () => void;
  signal?: 'close';
  loader?: boolean;
  hidden?: boolean;
  // meta information
  meta?: WithdrawalInfoMeta | undefined;
};

type ToastProps = Toast & {
  state?: ToastState;
};

export const toastIconMapping: { [i in Intent]: IconName } = {
  [Intent.None]: IconNames.HELP,
  [Intent.Primary]: IconNames.INFO_SIGN,
  [Intent.Secondary]: IconNames.INFO_SIGN,
  [Intent.Info]: IconNames.INFO_SIGN,
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
        className={cn(
          'mt-[10px] rounded p-2',
          'font-mono text-[12px] font-normal leading-[16px]',
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

type CollapsiblePanelProps = {
  actions?: ReactNode;
};
export const CollapsiblePanel = forwardRef<
  HTMLDivElement,
  CollapsiblePanelProps & HTMLAttributes<HTMLDivElement>
>(({ children, className, actions, ...props }, ref) => {
  const t = useT();
  const [collapsed, setCollapsed] = useState(true);
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-panel
      ref={ref}
      data-test
      className={cn(
        'relative',
        'mt-[10px] rounded p-2',
        'font-mono text-[12px] font-normal leading-[16px]',
        '[&>h4]:font-bold',
        'overflow-auto',
        {
          'h-[64px] overflow-hidden': collapsed,
          'pb-4': !collapsed,
        },
        className
      )}
      aria-expanded={!collapsed}
      onDoubleClick={(e) => {
        e.preventDefault();
        setCollapsed(!collapsed);
      }}
      {...props}
    >
      {children}
      {collapsed && (
        <div
          data-panel-curtain
          className={cn(
            'bg-gradient-to-b from-transparent to-inherit',
            'pointer-events-none absolute bottom-0 left-0 h-8 w-full'
          )}
        ></div>
      )}
      <div
        data-panel-actions
        className={cn(
          'absolute bottom-0 right-0',
          'p-2',
          'rounded-tl',
          'flex gap-1 align-middle'
        )}
      >
        {actions}
        <button
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setCollapsed(!collapsed);
          }}
          title={collapsed ? t('Expand') : t('Collapse')}
          aria-label={collapsed ? t('Expand') : t('Collapse')}
        >
          {collapsed ? (
            <Icon name="expand-all" size={3} />
          ) : (
            <Icon name="collapse-all" size={3} />
          )}
        </button>
      </div>
    </div>
  );
});

export const ToastHeading = forwardRef<
  HTMLHeadingElement,
  HtmlHTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => (
  <h3 ref={ref} className={cn('mb-1 text-sm uppercase', className)} {...props}>
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
      className={cn(
        'w-[320px] overflow-hidden rounded-md',
        'shadow-[8px_8px_16px_0_rgba(0,0,0,0.4)]',
        'text-black dark:text-white',
        'text-sm leading-[19px]',
        // background
        {
          'bg-gs-100 ': intent === Intent.None,
          'bg-blue-300 dark:bg-blue-700': intent === Intent.Primary,
          'bg-green-300 dark:bg-green-700': intent === Intent.Success,
          'bg-orange-300 dark:bg-orange-700': intent === Intent.Warning,
          'bg-red-300 dark:bg-red-700': intent === Intent.Danger,
        },
        // panel's colours
        {
          '[&_[data-panel]]:bg-gs-200': intent === Intent.None,
          '[&_[data-panel]]:bg-blue-350 [&_[data-panel]]:dark:bg-blue-650':
            intent === Intent.Primary,
          '[&_[data-panel]]:bg-green-350 [&_[data-panel]]:dark:bg-green-650':
            intent === Intent.Success,
          '[&_[data-panel]]:bg-orange-350 [&_[data-panel]]:dark:bg-orange-650':
            intent === Intent.Warning,
          '[&_[data-panel]]:bg-red-350 [&_[data-panel]]:dark:bg-red-650':
            intent === Intent.Danger,
        },
        {
          '[&_[data-panel]]:to-gs-200': intent === Intent.None,
          '[&_[data-panel]]:to-blue-350 [&_[data-panel]]:dark:to-blue-650':
            intent === Intent.Primary,
          '[&_[data-panel]]:to-green-350 [&_[data-panel]]:dark:to-green-650':
            intent === Intent.Success,
          '[&_[data-panel]]:to-orange-350 [&_[data-panel]]:dark:to-orange-650':
            intent === Intent.Warning,
          '[&_[data-panel]]:to-red-350 [&_[data-panel]]:dark:to-red-650':
            intent === Intent.Danger,
        },
        // panel's actions
        {
          '[&_[data-panel-actions]]:bg-gs-200': intent === Intent.None,
          '[&_[data-panel-actions]]:bg-blue-400 [&_[data-panel-actions]]:dark:bg-blue-600':
            intent === Intent.Primary,
          '[&_[data-panel-actions]]:bg-green-400 [&_[data-panel-actions]]:dark:bg-green-600':
            intent === Intent.Success,
          '[&_[data-panel-actions]]:bg-orange-400 [&_[data-panel-actions]]:dark:bg-orange-600':
            intent === Intent.Warning,
          '[&_[data-panel-actions]]:bg-red-400 [&_[data-panel-actions]]:dark:bg-red-600':
            intent === Intent.Danger,
        },
        // panels's progress bar colours
        '[&_[data-progress-bar]]:mb-[4px] [&_[data-progress-bar]]:mt-[10px]',
        {
          '[&_[data-progress-bar]]:bg-gs-200': intent === Intent.None,
          '[&_[data-progress-bar]]:bg-blue-400 [&_[data-progress-bar]]:dark:bg-blue-600':
            intent === Intent.Primary,
          '[&_[data-progress-bar-value]]:bg-blue-500 [&_[data-progress-bar-value]]:dark:bg-blue-500':
            intent === Intent.Primary,
          '[&_[data-progress-bar]]:bg-green-400 [&_[data-progress-bar]]:dark:bg-green-600':
            intent === Intent.Success,
          '[&_[data-progress-bar-value]]:bg-green-600 [&_[data-progress-bar-value]]:dark:bg-green-500':
            intent === Intent.Success,
          '[&_[data-progress-bar]]:bg-orange-400 [&_[data-progress-bar]]:dark:bg-orange-600':
            intent === Intent.Warning,
          '[&_[data-progress-bar-value]]:bg-orange-500 [&_[data-progress-bar-value]]:dark:bg-orange-500':
            intent === Intent.Warning,
          '[&_[data-progress-bar]]:bg-pink-400 [&_[data-progress-bar]]:dark:bg-pink-600':
            intent === Intent.Danger,
          '[&_[data-progress-bar-value]]:bg-red-500 [&_[data-progress-bar-value]]:dark:bg-red-500':
            intent === Intent.Danger,
        },
        {
          [styles['initial']]: state === 'initial',
          [styles['showing']]: state === 'showing',
          [styles['expired']]: state === 'expired',
        }
      )}
    >
      <div className="relative flex">
        <button
          type="button"
          data-testid="toast-close"
          onClick={closeToast}
          className="absolute right-0 top-0 z-20 flex items-center p-2"
        >
          <VegaIcon name={VegaIconNames.CROSS} size={12} />
        </button>
        <div
          data-testid="toast-accent"
          className={cn(
            {
              // gray
              'bg-gs-200 text-gs-400': intent === Intent.None,
              // blue
              'bg-blue-500 text-blue-600': intent === Intent.Primary,
              // green
              'bg-green-500 text-green-600': intent === Intent.Success,
              // orange
              'bg-orange-500 text-orange-600': intent === Intent.Warning,
              // red
              'bg-red-500 text-red-600': intent === Intent.Danger,
            },
            'w-8 p-2',
            'flex justify-center'
          )}
        >
          {loader ? (
            <div className="h-[15px] w-[15px]">
              <Loader size="small" />
            </div>
          ) : (
            <Icon
              name={toastIconMapping[intent]}
              size={4}
              className="!block !h-[14px] !w-[14px]"
            />
          )}
        </div>
        <div
          className={cn(
            'relative',
            'flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]'
          )}
          data-testid="toast-content"
        >
          {content}
          {withProgress && (
            <div
              ref={progressRef}
              data-testid="toast-progress-bar"
              className={cn(
                {
                  'bg-gs-200': intent === Intent.None,
                  'bg-blue-400 dark:bg-blue-600': intent === Intent.Primary,
                  'bg-green-400 dark:bg-green-600': intent === Intent.Success,
                  'bg-orange-400 dark:bg-orange-600': intent === Intent.Warning,
                  'bg-red-400 dark:bg-red-600': intent === Intent.Danger,
                },
                'absolute bottom-0 left-0 h-[4px] w-full',
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
