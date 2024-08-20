import { Intent, Button } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { ComponentProps, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

const RAINBOW_TAB_STYLE = cn(
  'inline-block',
  'bg-surface-2',
  'hover:bg-gs-400',
  'data-[state="active"]:text-white data-[state="active"]:bg-rainbow',
  'data-[state="active"]:hover:bg-none data-[state="active"]:hover:bg-pink-500 dark:data-[state="active"]:hover:bg-pink-500',
  '[&.active]:text-white [&.active]:bg-rainbow',
  '[&.active]:hover:bg-none [&.active]:hover:bg-pink-500 dark:[&.active]:hover:bg-pink-500',
  'px-5 py-3',
  'first:rounded-tl-lg last:rounded-tr-lg'
);

const DISABLED_RAINBOW_TAB_STYLE = cn(
  'pointer-events-none',
  'text-surface-1-fg ',
  'data-[state="active"]:text-white',
  '[&.active]:text-white'
);

const TAB_STYLE = cn(
  'inline-block',
  'bg-transparent',
  'text-surface-2-fg ',
  'hover:text-surface-1-fg ',
  'data-[state="active"]:text-black dark:data-[state="active"]:text-white',
  'data-[state="active"]:border-b-2 data-[state="active"]:border-b-black dark:data-[state="active"]:border-b-white',
  '[&.active]:text-black dark:[&.active]:text-white',
  '[&.active]:border-b-2 [&.active]:border-b-black dark:[&.active]:border-b-white',
  'mx-4 px-0 py-3',
  'uppercase'
);
const DISABLED_TAB_STYLE = cn('pointer-events-none');

export const RainbowTabButton = forwardRef<
  HTMLButtonElement,
  { disabled?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, disabled = false, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      RAINBOW_TAB_STYLE,
      { 'pointer-events-none': disabled },
      className
    )}
    {...props}
  >
    {children}
  </button>
));
RainbowTabButton.displayName = 'RainbowTabButton';

export const RainbowTabLink = ({
  to,
  children,
  className,
  disabled = false,
  ...props
}: { disabled?: boolean } & ComponentProps<typeof NavLink>) => (
  <NavLink
    to={to}
    className={cn(
      RAINBOW_TAB_STYLE,
      disabled && DISABLED_RAINBOW_TAB_STYLE,
      typeof className === 'string' ? className : undefined
    )}
    {...props}
  >
    {children}
  </NavLink>
);

export const TabLink = ({
  to,
  children,
  className,
  disabled = false,
  ...props
}: { disabled?: boolean } & ComponentProps<typeof NavLink>) => (
  <NavLink
    to={to}
    className={cn(
      TAB_STYLE,
      disabled && DISABLED_TAB_STYLE,
      typeof className === 'string' ? className : undefined
    )}
    {...props}
  >
    {children}
  </NavLink>
);

export const ReferralButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Button>
>(({ children, intent, type, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      intent={intent || type === 'submit' ? Intent.Primary : Intent.None}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
});
ReferralButton.displayName = 'Button';
