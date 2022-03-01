import classNames from 'classnames';

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
      'text-light-gray-50',
      'text-ui',
    ],
    {
      'border-intent-danger': intent === 'danger',
      'border-intent-warning': intent === 'warning',
    },
    className
  );
  return <div className={effectiveClassName}>{children}</div>;
};

export default InputError;
