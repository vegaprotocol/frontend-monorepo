import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { Intent } from '../../utils/intent';
import { Notification } from '../notification';

interface InputErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  intent?: 'danger' | 'warning';
  forInput?: string;
}

interface NotificationErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  intent?: Intent | 'danger' | 'warning';
  forInput?: string;
}

const getIntent = (intent: Intent | 'danger' | 'warning') => {
  switch (intent) {
    case 'danger':
      return Intent.Danger;
    case 'warning':
      return Intent.Warning;
    default:
      return intent;
  }
};

export const NotificationError = ({
  intent = Intent.Danger,
  children,
  forInput,
}: NotificationErrorProps) => {
  return (
    <Notification
      intent={getIntent(intent)}
      testId={'input-error-text'}
      message={<div className="role">{children}</div>}
      aria-describedby={forInput}
    />
  );
};

export const InputError = ({
  intent = 'danger',
  children,
  forInput,
  ...props
}: InputErrorProps) => {
  const effectiveClassName = classNames(
    'text-sm flex items-center first-letter:uppercase',
    'mt-2',
    {
      'border-danger': intent === 'danger',
      'border-warning': intent === 'warning',
    },
    {
      'text-warning': intent === 'warning',
      'text-danger': intent === 'danger',
    }
  );
  return (
    <div
      data-testid="input-error-text"
      aria-describedby={forInput}
      className={effectiveClassName}
      {...props}
      role="alert"
    >
      {children}
    </div>
  );
};
