import classNames from 'classnames';
import type { ReactNode } from 'react';
import classnames from 'classnames';

interface FormGroupProps {
  children: ReactNode;
  label: string; // For accessibility reasons this must always be set for screen readers. If you want it to not show, then add labelClassName="sr-only"
  labelFor: string; // Same as above
  labelAlign?: 'left' | 'right';
  labelClassName?: string;
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
  labelClassName,
  className,
  hasError,
}: FormGroupProps) => {
  return (
    <div
      data-testid="form-group"
      className={classnames(className, { 'mb-20': !className?.includes('mb') })}
    >
      {label && (
        <label className={labelClassName} htmlFor={labelFor}>
          {
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
          }
        </label>
      )}
      {children}
    </div>
  );
};
