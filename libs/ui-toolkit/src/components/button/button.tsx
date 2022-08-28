import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import classnames from 'classnames';

type ButtonVariant = 'default' | 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md' | 'sm';

const base =
  'inline-block uppercase border-2 rounded-md disabled:opacity-40 transition-colors';
const sm = 'px-8 py-2';
const md = 'px-10 py-2';
const lg = 'px-14 py-4';
const fillClasses = 'block w-full';
const defaultClasses = [
  'text-black dark:text-white',
  'border-black dark:border-white',
  'bg-white dark:bg-black',
  'enabled:hover:bg-neutral-200 dark:enabled:hover:bg-netural-800',
  'enabled:active:bg-neutral-200 dark:enabled:active:bg-neutral-500',
];
const primary = [
  'text-black',
  'border-vega-yellow',
  'bg-vega-yellow',
  'enabled:hover:bg-vega-yellow-dark enabled:hover:border-vega-yellow-dark',
  'enabled:active:bg-vega-yellow-dark enabled:active:border-vega-yellow-dark',
];
const secondary = [
  'text-white',
  'border-vega-pink',
  'bg-vega-pink',
  'enabled:hover:bg-vega-pink-dark enabled:hover:border-vega-pink-dark',
  'enabled:active:bg-vega-pink-dark enabled:active:border-vega-pink-dark',
];

const getClassname = ({
  variant,
  size,
  fill,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fill: boolean;
}) => {
  const className = classnames(base, {
    [defaultClasses.join(' ')]: variant === 'default',
    [primary.join(' ')]: variant === 'primary',
    [secondary.join(' ')]: variant === 'secondary',
    [lg]: size === 'lg',
    [md]: size === 'md',
    [sm]: size === 'sm',
    [fillClasses]: fill,
  });
  return className;
};

interface CommonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  fill?: boolean;
  size?: ButtonSize;
  icon?: IconName;
  rightIcon?: IconName;
}
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>,
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
      ...props
    },
    ref
  ) => {
    const className = getClassname({ variant, size, fill });
    return (
      <button ref={ref} type={type} className={className} {...props}>
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
      size = 'lg',
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

type ButtonLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
>;

export const ButtonLink = forwardRef<HTMLButtonElement, ButtonLinkProps>(
  (props, ref) => {
    const className = classnames('inline underline');
    return <button ref={ref} className={className} {...props} />;
  }
);

interface ButtonContentProps {
  children: ReactNode;
  icon?: IconName;
  rightIcon?: IconName;
}

const ButtonContent = ({ children, icon, rightIcon }: ButtonContentProps) => {
  const iconEl = icon ? (
    <Icon name={icon} className="fill-current mr-4 align-text-top" />
  ) : null;
  const rightIconEl = rightIcon ? (
    <Icon name={rightIcon} className="fill-current ml-4 align-text-top" />
  ) : null;

  return (
    <>
      {iconEl}
      {children}
      {rightIconEl}
    </>
  );
};
