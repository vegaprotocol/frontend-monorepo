import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

interface InputErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  intent?: 'danger' | 'warning';
  forInput?: string;
  testId?: string;
}

export const InputError = ({
  intent = 'danger',
  children,
  forInput,
  testId,
  className,
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
      data-testid={testId || 'input-error-text'}
      aria-describedby={forInput}
      className={classNames(effectiveClassName, className)}
      {...props}
      role="alert"
    >
      {children}
    </div>
  );
};
