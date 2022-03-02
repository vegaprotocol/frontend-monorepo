import classNames from 'classnames';
import { inputClassNames, inputStyle } from '../input/input';

/* eslint-disable-next-line */
export interface TextAreaProps {
  onChange?: React.FormEventHandler<HTMLSelectElement>;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export function Select({
  hasError,
  onChange,
  disabled,
  className,
  children,
}: TextAreaProps) {
  return (
    <select
      onChange={onChange}
      className={classNames(
        inputClassNames({ hasError, disabled, className }),
        'h-28'
      )}
      disabled={disabled}
      style={inputStyle({ disabled })}
    >
      {children}
    </select>
  );
}
