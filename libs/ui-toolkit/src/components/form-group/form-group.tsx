import classNames from 'classnames';
import type { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  label?: string;
  labelAlign?: 'left' | 'right';
  labelDescription?: string;
  className?: string;
  hasError?: boolean;
}

export const FormGroup = ({
  children,
  label,
  labelDescription,
  labelAlign = 'left',
  className,
  hasError,
}: FormGroupProps) => {
  return (
    <div
      data-testid="form-group"
      className={className?.includes('mb') ? className : `${className} mb-20`}
    >
      {label ? (
        <label>
          <div
            className={classNames(
              'mb-4 text-body-large text-black dark:text-white',
              {
                'border-l-4 border-danger pl-8': hasError,
                'text-right': labelAlign === 'right',
              }
            )}
          >
            <div className="font-bold mb-2">{label}</div>
            {labelDescription && (
              <div className={classNames({ 'text-danger': hasError })}>
                {labelDescription}
              </div>
            )}
          </div>
          {children}
        </label>
      ) : (
        { children }
      )}
    </div>
  );
};
