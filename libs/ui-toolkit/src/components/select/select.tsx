import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { defaultFormElement } from '../../utils/shared';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, ...props }, ref) => (
    <select
      ref={ref}
      {...props}
      className={classNames(defaultFormElement(hasError), className, 'h-28')}
    />
  )
);
