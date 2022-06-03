import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
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

interface CommonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'inline' | 'inline-link';
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
}
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {}

export interface AnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

const getClasses = (
  variant: CommonProps['variant'],
  paddingLeftProvided: boolean,
  paddingRightProvided: boolean,
  borderWidthProvided: boolean,
  heightProvided: boolean
) => {
  // Add classes into variables if there are multiple classes shared in multiple button styles
  const sharedClasses =
    'inline-flex items-center justify-center box-border transition-all disabled:no-underline';
  const underlineOnHover = 'no-underline hover:underline';
  const commonHoverAndActiveBorder =
    'hover:border-black dark:hover:border-white active:border-black dark:active:border-white';
  const commonDisabled =
    'disabled:bg-black-10 dark:disabled:bg-white-10 disabled:text-black-60 dark:disabled:text-white-60 disabled:border-black-25 dark:disabled:border-white-25';
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
  const buttonHeight = `${heightProvided ? heightProvided : 'h-28'}`;

  const primaryClasses = [
    sharedClasses,
    commonHoverAndActiveBorder,
    underlineOnHover,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-black dark:bg-white hover:bg-black-80 dark:hover:bg-white-80 active:bg-white dark:active:bg-black',
    'text-ui text-white dark:text-black active:text-black dark:active:text-white',
  ];

  const secondaryClasses = [
    sharedClasses,
    commonHoverAndActiveBorder,
    underlineOnHover,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-white dark:bg-black hover:bg-black-25 dark:hover:bg-white-25 active:bg-black dark:active:bg-white',
    'text-ui text-black dark:text-white active:text-white dark:active:text-black',
    'border-black-60 dark:border-white-60 hover:border-black',
  ];

  const accentClasses = [
    sharedClasses,
    commonHoverAndActiveBorder,
    underlineOnHover,
    commonDisabled,
    standardButtonPaddingLeft,
    standardButtonPaddingRight,
    standardButtonBorderWidth,
    buttonHeight,
    'bg-vega-yellow dark:bg-vega-yellow hover:bg-yellow/dark dark:hover:bg-vega-yellow/30 active:bg-white dark:active:bg-black',
    'text-ui uppercase text-black dark:text-black hover:text-white dark:hover:text-white active:text-black dark:active:text-white',
    'border-transparent dark:border-transparent',
  ];

  const inlineClasses = [
    sharedClasses,
    inlineButtonPaddingLeft,
    inlineButtonPaddingRight,
    buttonHeight,
    inlineTextColour,
    'border-none',
    'text-ui',
  ];

  const inlineLinkClasses = [
    sharedClasses,
    inlineButtonPaddingLeft,
    inlineButtonPaddingRight,
    buttonHeight,
    inlineTextColour,
    'underline hover:underline',
    'border-none',
  ];

  switch (variant) {
    case 'primary':
      return primaryClasses;
    case 'secondary':
      return secondaryClasses;
    case 'accent':
      return accentClasses;
    case 'inline':
      return inlineClasses;
    case 'inline-link':
      return inlineLinkClasses;
    default:
      return '';
  }
};

const classes = (
  className: CommonProps['className'],
  variant: CommonProps['variant']
) => {
  const paddingLeftProvided = includesLeftPadding(className);
  const paddingRightProvided = includesRightPadding(className);
  const borderWidthProvided = includesBorderWidth(className);
  const heightProvided = includesHeight(className);

  return classNames(
    getClasses(
      variant,
      paddingLeftProvided,
      paddingRightProvided,
      borderWidthProvided,
      heightProvided
    ),
    className
  );
};

const getContent = (
  children: React.ReactNode,
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
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={classes(className, variant)}
        type={type}
        {...props}
      >
        {getContent(children, prependIconName, appendIconName)}
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
      ...props
    },
    ref
  ) => {
    return (
      <a ref={ref} className={classes(className, variant)} {...props}>
        {getContent(children, prependIconName, appendIconName)}
      </a>
    );
  }
);
