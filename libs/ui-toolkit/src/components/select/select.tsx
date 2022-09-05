import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { Icon } from '..';
import { defaultSelectElement } from '../../utils/shared';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, ...props }, ref) => (
    <div className="flex items-center relative">
      <select
        ref={ref}
        {...props}
        className={classNames(
          defaultSelectElement(hasError),
          className,
          'appearance-none rounded-md'
        )}
      />
      <Icon name="chevron-down" className="absolute right-4 z-10" />
    </div>
  )
);
