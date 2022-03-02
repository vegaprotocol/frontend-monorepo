import { InputHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from '../icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
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
      'border',
      'border-light-gray-50',
      'bg-neutral-753',
      'text-light-gray-50',
      'text-ui',
      'focus-visible:shadow-focus',
      'focus-visible:outline-0',
    ],
    {
      'pl-8': !className?.match(/(^| )p(l|x)-\d+( |$)/),
      'pr-8': !className?.match(/(^| )p(r|x)-\d+( |$)/),
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prependIconName, appendIconName, className, ...props }, ref) => {
    className = `${className} h-28`;
    if (prependIconName) {
      className += ' pl-28';
    }
    if (appendIconName) {
      className += ' pr-28';
    }
    const input = (
      <input
        {...props}
        ref={ref}
        className={classNames(inputClassNames({ className, ...props }))}
        style={inputStyle(props)}
      />
    );
    const iconName = prependIconName || appendIconName;
    if (iconName !== undefined) {
      const iconClassName = classNames(
        ['fill-light-gray-50', 'absolute', 'z-10'],
        {
          'left-8': prependIconName,
          'right-8': appendIconName,
        }
      );
      const icon = <Icon name={iconName} className={iconClassName} size={16} />;
      return (
        <div className="inline-flex items-center relative">
          {prependIconName && icon}
          {input}
          {appendIconName && icon}
        </div>
      );
    }
    return input;
  }
);
