import classNames from 'classnames';
import type { ReactNode } from 'react';

export interface TradingFormGroupProps {
  children: ReactNode;
  className?: string;
  label: string | ReactNode; // For accessibility reasons this must always be set for screen readers. If you want it to not show, then use the hideLabel prop"
  labelFor: string; // Same as above
  hideLabel?: boolean;
  disabled?: boolean;
  labelDescription?: string;
  labelAlign?: 'left' | 'right';
  compact?: boolean;
}

export const TradingFormGroup = ({
  children,
  className,
  label,
  labelFor,
  labelDescription,
  labelAlign = 'left',
  hideLabel = false,
  compact = false,
  disabled = false,
}: TradingFormGroupProps) => {
  const wrapperClasses = classNames(
    'relative',
    {
      'mb-2': compact,
      'mb-4': !compact,
    },
    className
  );
  const labelClasses = classNames('block mb-1 text-xs text-secondary', {
    'text-right': labelAlign === 'right',
    'sr-only': hideLabel,
    'text-muted': disabled,
  });
  return (
    <div data-testid="form-group" className={wrapperClasses}>
      {label && (
        <label htmlFor={labelFor} className={labelClasses}>
          {label}
          {labelDescription && (
            <div className="font-light mt-1 text-muted">{labelDescription}</div>
          )}
        </label>
      )}
      {children}
    </div>
  );
};
