import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';
import { TradingButton } from '../trading-button';

type NotificationProps = {
  intent: Intent;
  message: ReactNode | string;
  size?: 'small' | 'medium';
  title?: string;
  buttonProps?: {
    text: string;
    action: () => void;
    className?: string;
    dataTestId?: string;
    size?: ComponentProps<typeof TradingButton>['size'];
  };
  testId?: string;
};

const getIcon = (intent: Intent): IconName => {
  const mapping: Record<Intent, string> = {
    [Intent.None]: IconNames.INFO_SIGN,
    [Intent.Info]: IconNames.INFO_SIGN,
    [Intent.Primary]: IconNames.INFO_SIGN,
    [Intent.Success]: IconNames.TICK_CIRCLE,
    [Intent.Warning]: IconNames.WARNING_SIGN,
    [Intent.Danger]: IconNames.ERROR,
  };
  return mapping[intent] as IconName;
};

export const Notification = ({
  intent,
  message,
  title,
  size = 'small',
  testId,
  buttonProps,
}: NotificationProps) => {
  if (intent === Intent.Primary) {
    intent = Intent.Info;
  }

  return (
    <div
      data-testid={testId || 'notification'}
      className={classNames(
        {
          'border-vega-clight-500 dark:border-vega-cdark-500':
            intent === Intent.None,
          'border-vega-blue-350 dark:border-vega-blue-650':
            intent === Intent.Info,
          'border-vega-green-350 dark:border-vega-green-650':
            intent === Intent.Success,
          'border-vega-orange-350 dark:border-vega-orange-650':
            intent === Intent.Warning,
          'border-vega-red-350 dark:border-vega-red-650':
            intent === Intent.Danger,
        },
        {
          'bg-vega-clight-700 dark:bg-vega-cdark-700 ': intent === Intent.None,
          'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Info,
          'bg-vega-green-300 dark:bg-vega-green-700': intent === Intent.Success,
          'bg-vega-orange-300 dark:bg-vega-orange-700':
            intent === Intent.Warning,
          'bg-vega-red-300 dark:bg-vega-red-700': intent === Intent.Danger,
        },
        'shadow-[0px_2px_4px_0px_rgba(0,0,0,0.09)]',
        'border rounded-[2px] p-2',
        'flex items-start gap-1.5'
      )}
    >
      <div
        className={classNames(
          {
            'text-vega-clight-50 dark:text-vega-cdark-50':
              intent === Intent.None,
            'text-vega-blue-500': intent === Intent.Info,
            'text-vega-green-500': intent === Intent.Success,
            'text-yellow-500': intent === Intent.Warning,
            'text-vega-red-500': intent === Intent.Danger,
            'mt-[0.125rem]': !title || (!!title && size === 'small'),
            'mt-1': !!title && size === 'medium',
          },
          'flex items-start'
        )}
      >
        <Icon size={4} name={getIcon(intent)} />
      </div>
      <div
        className={classNames(
          'flex flex-col items-start overflow-hidden gap-0',
          'text-vega-clight-50 dark:text-vega-cdark-50',
          'font-alpha',
          { 'text-sm': size === 'small', 'text-base': size === 'medium' }
        )}
      >
        {title && (
          <div
            key="title"
            className="uppercase leading-none mb-2 max-w-full"
            title={title}
          >
            <span className="block truncate">{title}</span>
          </div>
        )}
        <div
          key="message"
          className={classNames('[word-break:break-word]', {
            'mb-3': buttonProps,
          })}
        >
          {message}
        </div>
        {buttonProps && (
          <TradingButton
            intent={intent}
            size={buttonProps.size || 'small'}
            onClick={buttonProps.action}
            className={classNames(buttonProps.className)}
            data-testid={buttonProps.dataTestId}
            type="button"
          >
            {buttonProps.text}
          </TradingButton>
        )}
      </div>
    </div>
  );
};
