import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import { defaultFormElement } from '../../utils/shared';

type InputRootProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  labelDescription?: string;
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
      label,
      labelDescription,
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

    const inputClassName = classNames(
      'appearance-none',
      'h-28',
      'dark:color-scheme-dark',
      className,
      {
        'pl-28': hasPrepended,
        'pr-28': hasAppended,
      }
    );

    const input = (
      <input
        {...props}
        ref={ref}
        className={classNames(defaultFormElement(hasError), inputClassName)}
      />
    );

    const inputWithLabel = (
      <label>
        <div
          className={classNames(
            'mb-4 text-body-large text-black dark:text-white',
            {
              'border-l-4 border-danger pl-8': hasError,
            }
          )}
        >
          <div className="font-bold mb-2">{label}</div>
          {labelDescription && (
            <div className={classNames({ 'text-danger': hasError })}>
              {labelDescription}
            </div>
          )}
        </div>
        {input}
      </label>
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
        <div className="flex items-center relative">
          {hasPrepended && element}
          {label ? inputWithLabel : input}
          {hasAppended && element}
        </div>
      );
    }

    return label ? inputWithLabel : input;
  }
);
