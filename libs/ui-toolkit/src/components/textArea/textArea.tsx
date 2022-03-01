import classNames from 'classnames';

/* eslint-disable-next-line */
export interface TextAreaProps {
  onChange?: React.FormEventHandler<HTMLTextAreaElement>;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  children?: React.ReactNode;
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

export default TextArea;
