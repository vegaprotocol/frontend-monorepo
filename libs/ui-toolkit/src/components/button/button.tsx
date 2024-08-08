import classNames from 'classnames';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { Intent } from '../../utils/intent';
import { Link } from 'react-router-dom';

type ButtonProps = {
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
  classNames(
    'inline-flex gap-2 items-center justify-center disabled:opacity-40',
    // size
    {
      'h-12 px-6 rounded-lg': size === 'lg',
      'h-10 px-4 rounded': size === 'md',
      'h-8 px-3 rounded text-sm': size === 'sm',
      'h-6 px-2 rounded text-xs': size === 'xs',
    },
    // colours
    'enabled:hover:brightness-125',
    {
      'bg-intent-none text-gs-50': intent === Intent.None,
      'bg-intent-primary': intent === Intent.Primary,
      'bg-intent-secondary': intent === Intent.Secondary,
      'bg-intent-danger': intent === Intent.Danger,
      'bg-intent-info': intent === Intent.Info,
      'bg-intent-warning': intent === Intent.Warning,
      'bg-intent-success': intent === Intent.Success,
    },
    { 'w-full': fill },
    className
  );

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(
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

export const AnchorButton = ({
  size = 'md',
  intent = Intent.None,
  icon,
  href,
  children,
  className,
  fill,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonProps & { href: string }) => (
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
  const style = classNames('inline underline underline-offset-4', className);
  return <button ref={ref} className={style} type={type} {...props} />;
});
