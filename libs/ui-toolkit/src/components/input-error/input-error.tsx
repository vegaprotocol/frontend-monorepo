import classNames from 'classnames';
import { HTMLAttributes } from 'react';
import { Icon } from '../icon';

interface InputErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'danger' | 'warning';
}

export const InputError = ({
  intent = 'danger',
  className,
  children,
  ...props
}: InputErrorProps) => {
  const effectiveClassName = classNames(
    [
      'flex',
      'items-center',
      'box-border',
      'h-28',
      'border-l-4',
      'text-black-95 dark:text-white-95',
      'text-ui',
    ],
    {
      'border-intent-danger': intent === 'danger',
      'border-intent-warning': intent === 'warning',
    },
    className
  );
  const iconClassName = classNames(['mx-8'], {
    'fill-intent-danger': intent === 'danger',
    'fill-intent-warning': intent === 'warning',
  });
  return (
    <div className={effectiveClassName} {...props}>
      <Icon name="warning-sign" className={iconClassName} />
      {children}
    </div>
  );
};
