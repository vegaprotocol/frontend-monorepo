import classNames from 'classnames';
import { Icon } from '../icon';

interface InputErrorProps {
  children?: React.ReactNode;
  className?: string;
  intent?: 'danger' | 'warning';
}

export const InputError = ({
  intent = 'danger',
  className,
  children,
}: InputErrorProps) => {
  const effectiveClassName = classNames(
    [
      'inline-flex',
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
    <div className={effectiveClassName}>
      <Icon name="warning-sign" className={iconClassName} />
      {children}
    </div>
  );
};
