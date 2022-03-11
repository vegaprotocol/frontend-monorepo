import classNames from 'classnames';
import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  labelFor?: string;
  labelAlign?: 'left' | 'right';
}

export const FormGroup = ({
  children,
  label,
  labelFor,
  labelAlign = 'left',
}: FormGroupProps) => {
  const labelClasses = classNames('block text-ui mb-4', {
    'text-right': labelAlign === 'right',
  });
  return (
    <div className="mb-20">
      {label && (
        <label className={labelClasses} htmlFor={labelFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
