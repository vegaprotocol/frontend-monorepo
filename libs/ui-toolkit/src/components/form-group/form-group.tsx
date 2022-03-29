import classNames from 'classnames';
import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  labelFor?: string;
  labelAlign?: 'left' | 'right';
  className?: string;
}

export const FormGroup = ({
  children,
  label,
  labelFor,
  labelAlign = 'left',
  className,
}: FormGroupProps) => {
  const labelClasses = classNames('block text-ui mb-4', {
    'text-right': labelAlign === 'right',
  });
  return (
    <div
      data-testid="form-group"
      className={className?.includes('mb') ? className : `${className} mb-20`}
    >
      {label && (
        <label className={labelClasses} htmlFor={labelFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
