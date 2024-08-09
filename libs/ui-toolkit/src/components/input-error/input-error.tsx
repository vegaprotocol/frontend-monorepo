import { cn } from '@vegaprotocol/utils';
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
  const effectiveClassName = cn(
    'text-sm block items-center first-letter:capitalize',
    'mt-2 min-w-0 break-words',
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
      className={cn(effectiveClassName, className)}
      {...props}
      role="alert"
    >
      {children}
    </div>
  );
};
