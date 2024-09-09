import { cn } from '../../utils/cn';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { Intent } from '../../utils/intent';
import { Link } from 'react-router-dom';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'lg' | 'md' | 'sm' | 'xs';
  intent?: Intent | null;
  children?: ReactNode;
  icon?: ReactNode;
  fill?: boolean;
};

const getClassName = (
  { size, intent, fill }: Pick<ButtonProps, 'size' | 'intent' | 'fill'>,
  className?: string
) =>
  cn(
    'inline-flex gap-2 items-center justify-center disabled:opacity-40',
    // work around for ensuring we have a specifc border width for buttons,
    // giving it a name like border-btn doesnt work
    'border-999',
    // size
    {
      'h-12 px-6 rounded-button-lg text-base': size === 'lg',
      'h-10 px-4 rounded-button-md text-sm': size === 'md',
      'h-8 px-3 rounded-button-sm text-sm': size === 'sm',
      'h-6 px-2 rounded-button-xs text-xs': size === 'xs',
    },
    // colours
    'enabled:hover:brightness-90  dark:enabled:hover:brightness-110',
    {
      'bg-intent-none bg-gradient-to-tr from-intent-none-from to-intent-none-to text-intent-none-foreground border-intent-none-outline':
        intent === Intent.None,
      'bg-intent-primary bg-gradient-to-tr from-intent-primary-from to-intent-primary-to text-intent-primary-foreground border-intent-primary-outline font-mono font-semibold':
        intent === Intent.Primary,
      'bg-intent-secondary bg-gradient-to-tr from-intent-secondary-from to-intent-secondary-to text-intent-secondary-foreground':
        intent === Intent.Secondary,
      'bg-intent-danger text-intent-danger-foreground border-intent-danger-outline':
        intent === Intent.Danger,
      'bg-intent-info text-intent-info-foreground border-intent-info-outline':
        intent === Intent.Info,
      'bg-intent-warning text-intent-warning-foreground border-intent-warning-outline':
        intent === Intent.Warning,
      'bg-intent-success text-intent-success-foreground border-intent-success-outline':
        intent === Intent.Success,
    },
    { 'w-full': fill },
    className
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'md',
      intent = Intent.None,
      type = 'button',
      icon,
      children,
      className,
      fill,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-trading-button
      className={getClassName({ size, intent, fill }, className)}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
);

export type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonProps & { href: string };

export const AnchorButton = ({
  size = 'md',
  intent = Intent.None,
  icon,
  href,
  children,
  className,
  fill,
  ...props
}: AnchorButtonProps) => (
  <Link
    to={href}
    className={getClassName({ size, intent, fill }, className)}
    {...props}
  >
    {children}
    {icon}
  </Link>
);

export const ButtonLink = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ type = 'button', className, ...props }, ref) => {
  const style = cn('inline underline underline-offset-4', className);
  return <button ref={ref} className={style} type={type} {...props} />;
});
