import classNames from 'classnames';

/* eslint-disable-next-line */
export interface InputProps {
  onChange?: React.FormEventHandler<HTMLInputElement>;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string | number;
}

export const inputClassNames = ({
  hasError,
  disabled,
  className,
}: {
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}) =>
  classNames(
    [
      'inline-flex',
      'items-center',
      'box-border',
      'h-28',
      'pl-8',
      'pr-8',
      'border',
      'border-light-gray-50',
      'bg-neutral-753',
      'text-light-gray-50',
      'text-ui',
      'focus-visible:shadow-focus',
      'focus-visible:outline-0',
    ],
    {
      'border-vega-pink': hasError,
      'text-disabled': disabled,
      'bg-transparent': disabled,
    },
    className
  );

export const inputStyle = ({ disabled }: { disabled?: boolean }) => {
  const style: React.CSSProperties = {};
  if (disabled) {
    style.backgroundImage =
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAAXNSR0IArs4c6QAAACNJREFUGFdjtLS0/M8ABcePH2eEsRlJl4BpBdHIuuFmEi0BABqjEQVjx/LTAAAAAElFTkSuQmCC)';
  }
  return style;
};

export function Input({
  hasError,
  onChange,
  disabled,
  className,
  value,
}: InputProps) {
  return (
    <input
      onChange={onChange}
      className={classNames(
        inputClassNames({ hasError, disabled, className }),
        'h-28'
      )}
      value={value}
      disabled={disabled}
      style={inputStyle({ disabled })}
    />
  );
}

export default Input;
