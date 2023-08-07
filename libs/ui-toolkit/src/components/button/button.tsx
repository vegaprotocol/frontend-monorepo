import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import classnames from 'classnames';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ternary';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

const base =
  'inline-block uppercase border rounded-md disabled:opacity-60 text-base text-center';
const xs = 'px-2 py-0 text-sm';
const sm = 'px-2 py-1 text-sm';
const md = 'px-10 py-2 text-base';
const lg = 'px-14 py-4';
const fillClasses = 'block w-full';
const defaultClasses = [
  'border-neutral-500',
  'bg-transparent',
  'enabled:hover:bg-neutral-500/20 dark:enabled:hover:bg-neutral-500/40',
  'enabled:active:bg-neutral-500/20 dark:enabled:active:bg-neutral-500/40',
];
const primary = [
  'text-black',
  'border-vega-yellow',
  'bg-vega-yellow',
  'enabled:hover:bg-vega-yellow-550 enabled:hover:border-vega-yellow-550',
  'enabled:active:bg-vega-yellow-550 enabled:active:border-vega-yellow-550',
];
const secondary = [
  'text-white',
  'border-vega-pink',
  'dark:bg-vega-pink bg-vega-pink-550',
  'enabled:hover:bg-vega-pink enabled:hover:border-vega-pink',
  'enabled:active:bg-vega-pink enabled:active:border-vega-pink',
];
const ternary = [
  'text-black',
  'border-vega-green',
  'dark:bg-vega-green bg-vega-green-550',
  'enabled:hover:bg-vega-green enabled:hover:border-vega-green',
  'enabled:active:bg-vega-green enabled:active:border-vega-green',
];

const getClassname = ({
  variant,
  size,
  fill,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fill: boolean;
  className?: string;
}) => {
  return classnames(base, className, {
    [defaultClasses.join(' ')]: variant === 'default',
    [primary.join(' ')]: variant === 'primary',
    [secondary.join(' ')]: variant === 'secondary',
    [ternary.join(' ')]: variant === 'ternary',

    [lg]: size === 'lg',
    [md]: size === 'md',
    [sm]: size === 'sm',
    [xs]: size === 'xs',
    [fillClasses]: fill,
  });
};

interface CommonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  fill?: boolean;
  size?: ButtonSize;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      fill = false,
      type = 'button',
      icon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const buttonClasses = getClassname({ variant, size, fill, className });
    return (
      <button ref={ref} type={type} className={buttonClasses} {...props}>
        <ButtonContent icon={icon} rightIcon={rightIcon}>
          {children}
        </ButtonContent>
      </button>
    );
  }
);

export interface AnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      fill = false,
      icon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const className = getClassname({ variant, size, fill });
    return (
      <a ref={ref} className={className} {...props}>
        <ButtonContent icon={icon} rightIcon={rightIcon}>
          {children}
        </ButtonContent>
      </a>
    );
  }
);

type ButtonLinkProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'>;

export const ButtonLink = forwardRef<HTMLButtonElement, ButtonLinkProps>(
  ({ type = 'button', className, ...props }, ref) => {
    const style = classnames('inline underline', className);
    return <button ref={ref} className={style} type={type} {...props} />;
  }
);

interface ButtonContentProps {
  children: ReactNode;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

const ButtonContent = ({ children, icon, rightIcon }: ButtonContentProps) => {
  const iconEl = icon ? icon : null;
  const rightIconEl = rightIcon ? rightIcon : null;

  return (
    <>
      {iconEl}
      {children}
      {rightIconEl}
    </>
  );
};
