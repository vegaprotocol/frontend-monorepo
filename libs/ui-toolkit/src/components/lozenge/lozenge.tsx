import type { ReactNode } from 'react';
import classNames from 'classnames';

interface LozengeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'highlight';
  className?: string;
  details?: string;
}

const getWrapperClasses = (className: LozengeProps['className']) => {
  return classNames('inline-flex items-center gap-4', className);
};

const getLozengeClasses = (variant: LozengeProps['variant']) => {
  return classNames(['rounded-md', 'font-mono', 'leading-none', 'p-4'], {
    'bg-intent-success text-black': variant === 'success',
    'bg-intent-danger text-white': variant === 'danger',
    'bg-intent-warning text-black': variant === 'warning',
    'bg-intent-highlight text-black': variant === 'highlight',
    'bg-intent-help text-white': !variant,
  });
};

export const Lozenge = ({
  children,
  variant,
  className,
  details,
  ...props
}: LozengeProps) => {
  return (
    <span className={getWrapperClasses(className)} {...props}>
      <span className={getLozengeClasses(variant)}>{children}</span>

      {details && <span>{details}</span>}
    </span>
  );
};
