import { SelectHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';
import { inputClassNames } from '../input/input';

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
