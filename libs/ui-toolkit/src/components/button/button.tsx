import './button.css';
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

const getClassname = ({
  variant,
  size,
  fill,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fill: boolean;
}) => {
  const className = classnames('btn', {
    'btn-default': variant === 'default',
    'btn-primary': variant === 'primary',
    'btn-secondary': variant === 'secondary',
    'btn-lg': size === 'lg',
    'btn-md': size === 'md',
    'btn-sm': size === 'sm',
    'btn-fill': fill,
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
    <Icon name={icon} className="fill-current mr-8" size={16} />
  ) : null;
  const rightIconEl = rightIcon ? (
    <Icon name={rightIcon} className="fill-current ml-8" size={16} />
  ) : null;

  return (
    <>
      {iconEl}
      {children}
      {rightIconEl}
    </>
  );
};
