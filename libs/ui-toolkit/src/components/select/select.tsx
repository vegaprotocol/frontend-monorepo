import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { inputClassNames } from '../../utils/form-elements';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => (
    <select
      ref={ref}
      {...props}
      className={classNames(inputClassNames(props), 'h-28')}
    />
  )
);
