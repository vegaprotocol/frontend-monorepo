import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';
import { Button } from '../button';

type NotificationProps = {
  intent: Intent;
  message: ReactNode | string;
  title?: string;
  buttonProps?: { text: string; action: () => void; className?: string };
  testId?: string;
  className?: string;
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
  className,
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
          'border-yellow': intent === Intent.Warning,
          'border-vega-pink': intent === Intent.Danger,
        },
        'border rounded text-xs p-2 flex items-start gap-2.5 bg-neutral-100 dark:bg-neutral-900',
        className
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
          },
          'flex items-start mt-1'
        )}
      >
        <Icon size={4} name={getIcon(intent)} />
      </div>
      <div className="flex flex-col flex-grow items-start gap-1.5 text-base">
        {title && (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis uppercase text-sm leading-6">
            {title}
          </div>
        )}
        <div>{message}</div>
        {buttonProps && (
          <Button
            size="md"
            onClick={buttonProps.action}
            className={classNames(buttonProps.className)}
          >
            {buttonProps.text}
          </Button>
        )}
      </div>
    </div>
  );
};
