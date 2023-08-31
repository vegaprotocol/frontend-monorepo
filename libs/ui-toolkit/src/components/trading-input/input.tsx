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

export type TradingInputProps = InputRootProps & AffixProps;

export const tradingInputStyle = ({
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
}: Pick<TradingInputProps, keyof AffixProps>) => {
  const className = classNames(
    'absolute z-10 top-0 bottom-0 flex items-center',
    {
      'fill-black dark:fill-white': prependIconName || appendIconName,
      'left-3': prependIconName,
      'right-3': appendIconName,
      'left-1': prependElement,
      'right-1': appendElement,
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
        aria-label={iconDescription}
        aria-hidden={!iconDescription}
      />
    );
  }

  return null;
};

export const TradingInput = forwardRef<HTMLInputElement, TradingInputProps>(
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

    const inputClassName = classNames(
      'appearance-none dark:color-scheme-dark px-3 h-8',
      className,
      {
        'pl-9': hasPrepended,
        'pr-9': hasAppended,
      }
    );

    const input = (
      <input
        {...props}
        ref={ref}
        className={classNames(
          defaultFormElement(hasError, props.disabled),
          inputClassName
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
        <div className="relative">
          {hasPrepended && element}
          {input}
          {hasAppended && element}
        </div>
      );
    }

    return input;
  }
);
