import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface FormGroupProps {
  children: ReactNode;
  className?: string;
  label: string; // For accessibility reasons this must always be set for screen readers. If you want it to not show, then use the hideLabel prop"
  labelFor: string; // Same as above
  hideLabel?: boolean;
  labelDescription?: string;
  labelAlign?: 'left' | 'right';
}

export const FormGroup = ({
  children,
  className,
  label,
  labelFor,
  labelDescription,
  labelAlign = 'left',
  hideLabel = false,
}: FormGroupProps) => {
  const wrapperClasses = classNames('relative mb-2', className);
  const labelClasses = classNames('block mb-2 text-sm', {
    'text-right': labelAlign === 'right',
    'sr-only': hideLabel,
  });
  return (
    <div data-testid="form-group" className={wrapperClasses}>
      {label && (
        <label htmlFor={labelFor} className={labelClasses}>
          {label}
          {labelDescription && (
            <div className="font-light mt-1">{labelDescription}</div>
          )}
        </label>
      )}
      {children}
    </div>
  );
};
