import classNames from 'classnames';
import type { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  label: string; // For accessibility reasons this must always be set for screen readers. If you want it to not show, then add labelClassName="sr-only"
  labelFor: string; // Same as above
  labelAlign?: 'left' | 'right';
  labelDescription?: string;
  hasError?: boolean;
}

export const FormGroup = ({
  children,
  label,
  labelFor,
  labelDescription,
  labelAlign = 'left',
  hasError,
}: FormGroupProps) => {
  const labelClasses = classNames('block mb-2 text-sm', {
    'border-l-4 border-danger pl-8': hasError,
    'text-right': labelAlign === 'right',
  });
  return (
    <div data-testid="form-group" className="relative mb-6">
      {label && (
        <label htmlFor={labelFor} className={labelClasses}>
          <div className="mb-2">{label}</div>
          {labelDescription && (
            <div className={classNames({ 'text-vega-pink': hasError })}>
              {labelDescription}
            </div>
          )}
        </label>
      )}
      {children}
    </div>
  );
};
