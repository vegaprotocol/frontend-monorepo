import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FunctionComponent,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import type { IconName } from '../icon';
import { Icon } from '../icon';
import classnames from 'classnames';

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
  icon?: IconName;
  rightIcon?: IconName;
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
  'className'
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
    <Icon name={icon} className="fill-current mr-8" size={16} />
  ) : null;
  const rightIconEl = rightIcon ? (
    <Icon name={rightIcon} className="fill-current ml-8" size={16} />
  ) : null;
  return (
    <span className="flex items-center">
      {iconEl}
      {children}
      {rightIconEl}
    </span>
  );
};
