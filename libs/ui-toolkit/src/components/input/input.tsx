import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import {
  includesLeftPadding,
  includesRightPadding,
} from '../../utils/class-names';

type InputRootProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
};

type NoPrepend = {
  prependIconName?: never;
  prependIconDescription?: string;
  prependElement?: never;
};

type NoAppend = {
  appendIconName?: never;
  appendIconDescription?: string;
  appendElement?: never;
};

type InputPrepend = NoAppend &
  (
    | NoPrepend
    | {
        prependIconName: IconName;
        prependIconDescription?: string;
        prependElement?: never;
      }
    | {
        prependIconName?: never;
        prependIconDescription?: never;
        prependElement: ReactNode;
      }
  );

type InputAppend = NoPrepend &
  (
    | NoAppend
    | {
        appendIconName: IconName;
        appendIconDescription?: string;
        appendElement?: never;
      }
    | {
        appendIconName?: never;
        appendIconDescription?: never;
        appendElement: ReactNode;
      }
  );

type AffixProps = InputPrepend | InputAppend;

type InputProps = InputRootProps & AffixProps;

export const inputClassNames = ({
  hasError,
  className,
}: {
  hasError?: boolean;
  className?: string;
}) => {
  return classNames(
    [
      'appearance-none',
      'flex items-center w-full',
      'box-border',
      'border rounded-none',
      'bg-clip-padding',
      'dark:bg-white-25',
      'text-black placeholder:text-black-60 dark:text-white dark:placeholder:text-white-60',
      'text-ui',
      'focus:outline-none focus:vega-input-shadow-focus',
      'disabled:bg-black-10 disabled:dark:bg-white-10',
      'vega-input-shadow',
    ],
    {
      'pl-8': !includesLeftPadding(className),
      'pr-8': !includesRightPadding(className),
      'border-intent-danger focus:vega-input-shadow-focus-error': hasError,
      'border-t-black-60 border-l-black-60 border-b-black-40 border-r-black-40 dark:border-t-white-40 dark:border-l-white-40 dark:border-b-white-60 dark:border-r-white-60':
        !hasError,
    },
    className
  );
};

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

const getAffixElement = ({
  prependElement,
  prependIconName,
  prependIconDescription,
  appendElement,
  appendIconName,
  appendIconDescription,
}: Pick<InputProps, keyof AffixProps>) => {
  const position = prependIconName || prependElement ? 'pre' : 'post';

  const className = classNames(
    ['fill-black-60 dark:fill-white-60', 'absolute', 'z-10'],
    {
      'left-8': position === 'pre',
      'right-8': position === 'post',
    }
  );

  const element = prependElement || appendElement;
  const iconName = prependIconName || appendIconName;
  const iconDescription = prependIconDescription || appendIconDescription;

  if (element) {
    return <div className={className}>{element}</div>;
  }

  if (iconName) {
    return (
      <Icon
        name={iconName}
        className={className}
        size={16}
        aria-label={iconDescription}
        aria-hidden={!iconDescription}
      />
    );
  }

  return null;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      prependIconName,
      prependIconDescription,
      appendIconName,
      appendIconDescription,
      prependElement,
      appendElement,
      className,
      hasError,
      ...props
    },
    ref
  ) => {
    const hasPrepended = !!(prependIconName || prependElement);
    const hasAppended = !!(appendIconName || appendElement);

    const inputClassName = classNames('h-28', className, {
      'pl-28': hasPrepended ?? hasAppended,
    });

    const input = (
      <input
        {...props}
        ref={ref}
        className={classNames(
          inputClassNames({ className: inputClassName, hasError })
        )}
      />
    );

    const element = getAffixElement({
      prependIconName,
      prependIconDescription,
      appendIconName,
      appendIconDescription,
      prependElement,
      appendElement,
    });

    if (element) {
      return (
        <div className="inline-flex items-center relative">
          {hasPrepended && element}
          {input}
          {hasAppended && element}
        </div>
      );
    }

    return input;
  }
);
