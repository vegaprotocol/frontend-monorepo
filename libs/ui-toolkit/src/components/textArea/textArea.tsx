import { inputClassNames, inputStyle } from '../input/input';

/* eslint-disable-next-line */
export interface TextAreaProps {
  onChange?: React.FormEventHandler<HTMLTextAreaElement>;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
}

export function TextArea({
  hasError,
  onChange,
  disabled,
  className,
  children,
}: TextAreaProps) {
  return (
    <textarea
      onChange={onChange}
      className={inputClassNames({ hasError, disabled, className })}
      disabled={disabled}
      style={inputStyle({ disabled })}
    >
      {children}
    </textarea>
  );
}
