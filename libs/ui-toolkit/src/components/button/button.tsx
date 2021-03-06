import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import {
  includesLeftPadding,
  includesRightPadding,
  includesBorderWidth,
  includesHeight,
} from '../../utils/class-names';
import classnames from 'classnames';

interface CommonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'trade' | 'accent' | 'inline-link';
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
  boxShadow?: boolean;
}
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {}

export interface AnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

export const getButtonClasses = (
  className?: string,
  variant?: 'primary' | 'secondary' | 'trade' | 'accent' | 'inline-link',
  boxShadow?: boolean
) => {
  const paddingLeftProvided = includesLeftPadding(className);
  const paddingRightProvided = includesRightPadding(className);
  const borderWidthProvided = includesBorderWidth(className);
  const heightProvided = includesHeight(className);

  // Add classes into variables if there are multiple classes shared in multiple button styles
  const sharedClasses =
    'inline-flex items-center justify-center box-border transition-[background-color] ease-linear duration-50 disabled:no-underline';
  const commonButtonClasses = classnames(
    'relative disabled:static',
    'text-ui font-semibold focus-visible:outline-none border no-underline hover:no-underline',
    'py-[3px]',
    {
      'shadow-none': !boxShadow,
      'shadow-[3px_3px_0_0] focus-visible:shadow-vega-pink dark:focus-visible:shadow-vega-yellow active:top-[1px] active:left-[1px] active:shadow-[2px_2px_0_0]':
        boxShadow === undefined || boxShadow,
    }
  );
  const commonDisabled =
    'disabled:bg-black-10 dark:disabled:bg-white-10 disabled:text-black-60 dark:disabled:text-white-60 disabled:border-black-25 dark:disabled:border-white-25 disabled:shadow-none dark:disabled:shadow-none';
  const inlineTextColour =
    'text-black-95 dark:text-white-95 hover:text-black hover:dark:text-white active:text-black dark:active:text-vega-yellow';

  const standardButtonPaddingLeft = `${
    paddingLeftProvided ? paddingLeftProvided : 'pl-28'
  }`;
  const standardButtonPaddingRight = `${
    paddingRightProvided ? paddingRightProvided : 'pr-28'
  }`;
  const inlineButtonPaddingLeft = `${
    paddingLeftProvided ? paddingLeftProvided : 'pl-4'
  }`;
  const inlineButtonPaddingRight = `${
    paddingRightProvided ? paddingRightProvided : 'pr-4'
  }`;
  const standardButtonBorderWidth = `${
    borderWidthProvided ? borderWidthProvided : 'border'
  }`;
  const buttonHeight = `${heightProvided ? heightProvided : ''}`;

  const primaryClasses = [
    sharedClasses,
    commonButtonClasses,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-black dark:bg-white hover:bg-black-80 dark:hover:bg-white-90 active:bg-black-80 dark:active:bg-white-90',
    'border-white dark:border-black shadow-black active:shadow-black dark:shadow-white-80 dark:active:shadow-white',
    'text-white dark:text-black',
  ];

  const secondaryClasses = [
    sharedClasses,
    commonButtonClasses,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-white dark:bg-black hover:bg-black-25 dark:hover:bg-white-25',
    'border-black dark:border-white shadow-black dark:shadow-white',
    'text-black dark:text-white',
  ];

  const tradeClasses = [
    sharedClasses,
    commonButtonClasses,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-vega-green hover:bg-vega-green-medium',
    'border-black disabled:shadow-none dark:disabled:shadow-none shadow-black dark:shadow-white',
    'text-black',
  ];

  const accentClasses = [
    sharedClasses,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-vega-yellow dark:bg-vega-yellow hover:bg-vega-yellow-dark dark:hover:bg-vega-yellow-dark active:bg-white dark:active:bg-black',
    'uppercase text-black dark:text-black hover:text-white dark:hover:text-white active:text-black dark:active:text-white',
    'border-transparent dark:border-transparent',
  ];

  const inlineLinkClasses = [
    sharedClasses,
    inlineButtonPaddingLeft,
    inlineButtonPaddingRight,
    buttonHeight,
    inlineTextColour,
    'underline hover:underline hover:text-black-60 dark:hover:text-white-80',
    'border-none',
  ];

  let variantClasses: string[];

  switch (variant) {
    case 'primary':
      variantClasses = primaryClasses;
      break;
    case 'secondary':
      variantClasses = secondaryClasses;
      break;
    case 'trade':
      variantClasses = tradeClasses;
      break;
    case 'accent':
      variantClasses = accentClasses;
      break;
    case 'inline-link':
      variantClasses = inlineLinkClasses;
      break;
    default:
      variantClasses = [''];
  }

  return classNames(...variantClasses, className);
};

export const getButtonContent = (
  children: ReactNode,
  prependIconName?: IconName,
  appendIconName?: IconName
) => {
  const iconName = prependIconName || appendIconName;
  if (iconName === undefined) {
    return children;
  }
  const iconClassName = classNames(['fill-current'], {
    'mr-8': prependIconName,
    'ml-8': appendIconName,
  });
  const icon = <Icon name={iconName} className={iconClassName} size={16} />;
  return (
    <>
      {prependIconName && icon}
      {children}
      {appendIconName && icon}
    </>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      type = 'button',
      children,
      className,
      prependIconName,
      appendIconName,
      boxShadow,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={getButtonClasses(className, variant, boxShadow)}
        type={type}
        {...props}
      >
        {getButtonContent(children, prependIconName, appendIconName)}
      </button>
    );
  }
);

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  (
    {
      variant = 'primary',
      children,
      className,
      prependIconName,
      appendIconName,
      boxShadow,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        className={getButtonClasses(className, variant, boxShadow)}
        {...props}
      >
        {getButtonContent(children, prependIconName, appendIconName)}
      </a>
    );
  }
);
