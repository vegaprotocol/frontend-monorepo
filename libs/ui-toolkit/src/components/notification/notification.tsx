import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';
import type { ButtonSize } from '../button';
import { Button } from '../button';

type NotificationProps = {
  intent: Intent;
  message: ReactNode | string;
  title?: string;
  buttonProps?: {
    text: string;
    action: () => void;
    className?: string;
    dataTestId?: string;
    size?: ButtonSize;
  };
  testId?: string;
};

const getIcon = (intent: Intent): IconName => {
  const mapping = {
    [Intent.None]: IconNames.HELP,
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
  testId,
  buttonProps,
}: NotificationProps) => {
  return (
    <div
      data-testid={testId || 'notification'}
      className={classNames(
        {
          'border-gray-700 dark:border-gray-300': intent === Intent.None,
          'border-vega-blue': intent === Intent.Primary,
          'border-vega-green-550 dark:border-vega-green':
            intent === Intent.Success,
          'border-vega-orange': intent === Intent.Warning,
          'border-vega-pink': intent === Intent.Danger,
        },
        {
          'bg-vega-light-100 dark:bg-vega-dark-100 ': intent === Intent.None,
          'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Primary,
          'bg-vega-green-300 dark:bg-vega-green-700': intent === Intent.Success,
          'bg-vega-orange-300 dark:bg-vega-orange-700':
            intent === Intent.Warning,
          'bg-vega-pink-300 dark:bg-vega-pink-700': intent === Intent.Danger,
        },
        'border rounded p-2 flex items-start gap-2.5'
      )}
    >
      <div
        className={classNames(
          {
            'text-gray-700 dark:text-gray-300': intent === Intent.None,
            'text-vega-blue': intent === Intent.Primary,
            'text-vega-green dark:text-vega-green': intent === Intent.Success,
            'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
            'text-vega-pink': intent === Intent.Danger,
            'mt-1': !!title,
            'mt-[0.125rem]': !title,
          },
          'flex items-start mt-1'
        )}
      >
        <Icon size={4} name={getIcon(intent)} />
      </div>
      <div className="flex flex-col flex-grow items-start gap-1.5">
        {title && (
          <div
            key="title"
            className="whitespace-nowrap overflow-hidden text-ellipsis uppercase leading-6"
          >
            {title}
          </div>
        )}
        <div key="message" className="text-sm [word-break:break-word]">
          {message}
        </div>
        {buttonProps && (
          <Button
            size={buttonProps.size || 'sm'}
            onClick={buttonProps.action}
            className={classNames(buttonProps.className)}
            data-testid={buttonProps.dataTestId}
            type="button"
          >
            {buttonProps.text}
          </Button>
        )}
      </div>
    </div>
  );
};
