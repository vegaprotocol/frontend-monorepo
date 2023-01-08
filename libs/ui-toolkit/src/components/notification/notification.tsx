import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';

type NotificationProps = {
  intent: Intent;
  message: string;
  testId?: string;
  children?: ReactNode;
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
  testId,
  children,
}: NotificationProps) => {
  return (
    <div
      data-testid={testId || 'notification'}
      className={classNames(
        {
          'border-gray-700 dark:border-gray-300': intent === Intent.None,
          'border-vega-blue': intent === Intent.Primary,
          'border-vega-green dark:border-vega-green': intent === Intent.Success,
          'border-yellow-500': intent === Intent.Warning,
          'border-vega-pink': intent === Intent.Danger,
        },
        'border rounded px-3 py-1 text-xs mb-1 mr-1'
      )}
    >
      <div
        className={classNames(
          {
            'text-gray-700 dark:text-gray-300': intent === Intent.None,
            'text-vega-blue': intent === Intent.Primary,
            'text-vega-green dark:text-vega-green': intent === Intent.Success,
            'text-yellow-600 dark:text-yellow-500': intent === Intent.Warning,
            'text-vega-pink': intent === Intent.Danger,
          },
          'flex items-start'
        )}
      >
        <Icon size={3} className="mr-1 mt-[2px]" name={getIcon(intent)} />
        <span
          title={message}
          className="whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {message}
        </span>
      </div>
      {children}
    </div>
  );
};
