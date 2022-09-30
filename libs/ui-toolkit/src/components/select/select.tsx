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
    <div className="flex items-center relative bg-white dark:bg-black">
      <select
        ref={ref}
        {...props}
        className={classNames(
          defaultSelectElement(hasError),
          className,
          'appearance-none rounded-md z-20'
        )}
      />
      <Icon name="chevron-down" className="absolute right-4 z-10" />
    </div>
  )
);
