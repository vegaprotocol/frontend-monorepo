import { IconNames } from '@blueprintjs/icons';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { Intent } from '../../utils/intent';
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
      className={classNames(
        'flex items-start gap-2',
        'border rounded py-2 px-3',
        {
          'border-intent-none': intent === Intent.None,
          'border-intent-primary': intent === Intent.Primary,
          'border-intent-secondary': intent === Intent.Secondary,
          'border-intent-info': intent === Intent.Info,
          'border-intent-danger': intent === Intent.Danger,
          'border-intent-warning': intent === Intent.Warning,
          'border-intent-success': intent === Intent.Success,
        },
        {
          'bg-intent-none-background': intent === Intent.None,
          'bg-intent-primary-background': intent === Intent.Primary,
          'bg-intent-secondary-background': intent === Intent.Secondary,
          'bg-intent-info-background': intent === Intent.Info,
          'bg-intent-danger-background': intent === Intent.Danger,
          'bg-intent-warning-background': intent === Intent.Warning,
          'bg-intent-success-background': intent === Intent.Success,
        }
      )}
    >
      <div
        className={classNames(
          'pt-px',
          {
            'text-gs-50': intent === Intent.None,
            'text-intent-primary': intent === Intent.Primary,
            'text-intent-secondary': intent === Intent.Secondary,
            'text-intent-info': intent === Intent.Info,
            'text-intent-danger': intent === Intent.Danger,
            'text-intent-warning': intent === Intent.Warning,
            'text-intent-success': intent === Intent.Success,
          },
          'flex items-start'
        )}
      >
        <Icon size={4} name={getIcon(intent)} />
      </div>
      <div
        className={classNames(
          'flex flex-col items-start overflow-hidden gap-1.5',
          'text-gs-50 font-alpha text-sm'
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
            className={classNames(buttonProps.className)}
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
