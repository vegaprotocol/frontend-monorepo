import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import { cn } from '../../utils/cn';
import type { ComponentProps, ReactNode } from 'react';
import {
  getIntentBackground,
  getIntentBorder,
  getIntentText,
  Intent,
} from '../../utils/intent';
import { Icon } from '../icon';
import { Button } from '../button';

type NotificationProps = {
  intent?: Intent;
  message: ReactNode | string;
  title?: string;
  buttonProps?: {
    text: string;
    action: () => void;
    className?: string;
    dataTestId?: string;
    size?: ComponentProps<typeof Button>['size'];
    disabled?: boolean;
  };
  testId?: string;
};

const getIcon = (intent: Intent): IconName => {
  const mapping: Record<Intent, string> = {
    [Intent.None]: IconNames.INFO_SIGN,
    [Intent.Info]: IconNames.INFO_SIGN,
    [Intent.Secondary]: IconNames.INFO_SIGN,
    [Intent.Primary]: IconNames.INFO_SIGN,
    [Intent.Success]: IconNames.TICK_CIRCLE,
    [Intent.Warning]: IconNames.WARNING_SIGN,
    [Intent.Danger]: IconNames.ERROR,
  };
  return mapping[intent] as IconName;
};

export const Notification = ({
  intent = Intent.None,
  message,
  title,
  testId,
  buttonProps,
}: NotificationProps) => {
  return (
    <div
      data-testid={testId || 'notification'}
      className={cn(
        'flex items-start gap-2',
        'rounded py-2 px-3 border',
        getIntentBorder(intent),
        getIntentBackground(intent)
      )}
    >
      <div className={cn('pt-px flex items-start', getIntentText(intent))}>
        <Icon size={4} name={getIcon(intent)} />
      </div>
      <div
        className={cn(
          'flex flex-col items-start overflow-hidden gap-1.5',
          'text-gs-50 text-sm'
        )}
      >
        {title && (
          <h4
            key="title"
            className="uppercase max-w-full truncate"
            title={title}
          >
            {title}
          </h4>
        )}
        <div key="message" className="break-words">
          {message}
        </div>
        {buttonProps && (
          <Button
            intent={intent}
            size={buttonProps.size || 'sm'}
            onClick={buttonProps.action}
            className={cn(buttonProps.className)}
            data-testid={buttonProps.dataTestId}
            type="button"
            disabled={buttonProps.disabled || false}
          >
            {buttonProps.text}
          </Button>
        )}
      </div>
    </div>
  );
};
