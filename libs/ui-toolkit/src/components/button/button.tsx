import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import {
  includesLeftPadding,
  includesRightPadding,
  includesBorderWidth,
  includesHeight,
} from '../../utils/class-names';
import classnames from 'classnames';

type Variant = 'primary' | 'secondary' | 'trade' | 'accent' | 'inline-link';
interface CommonProps2 {
  children?: ReactNode;
  variant?: Variant;
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
  boxShadow?: boolean;
}
export interface ButtonProps2
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps2 {}

export const getButtonClasses = (
  className?: string,
  variant?: Variant,
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

  return classnames(...variantClasses, className);
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
  const iconClassName = classnames(['fill-current'], {
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

export const Button2 = forwardRef<HTMLButtonElement, ButtonProps2>(
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

const getClassname = ({
  variant,
  size,
  fill,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fill: boolean;
}) => {
  const baseClasses = classnames(
    'inline-block',
    'uppercase',
    'border-1 rounded',
    'disabled:opacity-40',
    'transition-colors',
    {
      'block w-full': fill,
    },
    {
      'text-ui px-16 py-4': size === 'sm',
      'text-ui px-20 py-5': size === 'md',
      'px-60 py-12': size === 'lg',
    }
  );
  const variants = {
    default: classnames(
      'text-black dark:text-white',
      'border-v2border dark:border-Dv2border',
      'bg-white dark:bg-black',
      'enabled:hover:bg-white-80 dark:enabled:hover:bg-black-80',
      'enabled:active:bg-white-80 enabled:active:border-black dark:enabled:active:bg-black-80 dark:enabled:active:border-white'
    ),
    primary: classnames(
      'text-black',
      'border-vega-yellow',
      'bg-vega-yellow',
      'enabled:hover:bg-vega-yellow-dark enabled:hover:border-vega-yellow-dark',
      'enabled:active:bg-vega-yellow-dark enabled:active:border-vega-yellow-dark'
    ),
    secondary: classnames(
      'text-white',
      'border-vega-pink',
      'bg-vega-pink',
      'enabled:hover:bg-vega-pink-dark enabled:hover:border-vega-pink-dark',
      'enabled:active:bg-vega-pink-dark enabled:active:border-vega-pink-dark'
    ),
  };
  const className = classnames(baseClasses, variants[variant]);
  return className;
};

type ButtonVariant = 'default' | 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md' | 'sm';

interface CommonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  fill?: boolean;
  size?: ButtonSize;
}
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    CommonProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'lg',
      fill = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const className = getClassname({ variant, size, fill });
    return <button ref={ref} type={type} className={className} {...props} />;
  }
);

export interface AnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  ({ variant = 'default', size = 'lg', fill = false, ...props }, ref) => {
    const className = getClassname({ variant, size, fill });
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a ref={ref} className={className} {...props} />;
  }
);

type ButtonLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
>;

export const ButtonLink = forwardRef<HTMLButtonElement, ButtonLinkProps>(
  (props, ref) => {
    const className = classnames('inline underline');
    return <button ref={ref} className={className} {...props} />;
  }
);
