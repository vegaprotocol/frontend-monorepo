import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { Icon } from '..';
import { defaultFormElement } from '../../utils/shared';

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
          defaultFormElement(hasError),
          className,
          'appearance-none h-28 pr-28'
        )}
      />
      <Icon name="chevron-down" className="absolute right-8 z-10" />
    </div>
  )
);
