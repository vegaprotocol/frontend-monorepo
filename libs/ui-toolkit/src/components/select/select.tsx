import { SelectHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';
import { inputClassNames } from '../input/input';

/* eslint-disable-next-line */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLTextAreaElement, SelectProps>(
  (props, ref) => (
    <select {...props} className={classNames(inputClassNames(props), 'h-28')} />
  )
);
