import { InputHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
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

export const inputStyle = ({
  style,
  disabled,
}: {
  style?: React.CSSProperties;
  disabled?: boolean;
}) =>
  disabled
    ? {
        ...style,
        backgroundImage:
          'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAAXNSR0IArs4c6QAAACNJREFUGFdjtLS0/M8ABcePH2eEsRlJl4BpBdHIuuFmEi0BABqjEQVjx/LTAAAAAElFTkSuQmCC)',
      }
    : style;

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={classNames(inputClassNames(props), 'h-28')}
    style={inputStyle(props)}
  />
));

export default Input;
