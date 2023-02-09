import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { Intent } from '../../utils/intent';
import { Notification } from '../notification';

interface InputErrorInlineProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  intent?: 'danger' | 'warning';
  forInput?: string;
}

interface InputErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  intent?: Intent;
  forInput?: string;
}

export const InputError = ({
  intent = Intent.Danger,
  children,
  forInput,
}: InputErrorProps) => {
  return (
    <Notification
      intent={intent}
      message={children}
      data-testid="input-error-text"
      aria-describedby={forInput}
    />
  );
};

export const InputErrorInline = ({
  intent = 'danger',
  children,
  forInput,
  ...props
}: InputErrorInlineProps) => {
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
