import classNames from 'classnames';
import type { ReactNode } from 'react';
import classnames from 'classnames';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  labelFor?: string;
  labelAlign?: 'left' | 'right';
  labelDescription?: string;
  className?: string;
  hasError?: boolean;
}

export const FormGroup = ({
  children,
  label,
  labelFor,
  labelDescription,
  labelAlign = 'left',
  className,
  hasError,
}: FormGroupProps) => {
  return (
    <div
      data-testid="form-group"
      className={classnames(className, { 'mb-20': !className?.includes('mb') })}
    >
      {label && (
        <label htmlFor={labelFor}>
          <div
            className={classNames(
              'mb-4 text-large text-black dark:text-white',
              {
                'border-l-4 border-danger pl-8': hasError,
                'text-right': labelAlign === 'right',
              }
            )}
          >
            <div className="font-medium mb-2">{label}</div>
            {labelDescription && (
              <div className={classNames({ 'text-danger': hasError })}>
                {labelDescription}
              </div>
            )}
          </div>
        </label>
      )}
      {children}
    </div>
  );
};
