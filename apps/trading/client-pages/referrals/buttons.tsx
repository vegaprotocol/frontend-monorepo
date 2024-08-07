import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ComponentProps, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

const RAINBOW_TAB_STYLE = classNames(
  'inline-block',
  'bg-gs-500 ',
  'hover:bg-gs-400 ',
  'data-[state="active"]:text-white data-[state="active"]:bg-rainbow',
  'data-[state="active"]:hover:bg-none data-[state="active"]:hover:bg-vega-pink-500 dark:data-[state="active"]:hover:bg-vega-pink-500',
  '[&.active]:text-white [&.active]:bg-rainbow',
  '[&.active]:hover:bg-none [&.active]:hover:bg-vega-pink-500 dark:[&.active]:hover:bg-vega-pink-500',
  'px-5 py-3',
  'first:rounded-tl-lg last:rounded-tr-lg'
);

const DISABLED_RAINBOW_TAB_STYLE = classNames(
  'pointer-events-none',
  'text-gs-100 ',
  'data-[state="active"]:text-white',
  '[&.active]:text-white'
);

const TAB_STYLE = classNames(
  'inline-block',
  'bg-transparent',
  'text-gs-200 ',
  'hover:text-gs-100 ',
  'data-[state="active"]:text-black dark:data-[state="active"]:text-white',
  'data-[state="active"]:border-b-2 data-[state="active"]:border-b-black dark:data-[state="active"]:border-b-white',
  '[&.active]:text-black dark:[&.active]:text-white',
  '[&.active]:border-b-2 [&.active]:border-b-black dark:[&.active]:border-b-white',
  'mx-4 px-0 py-3',
  'uppercase'
);
const DISABLED_TAB_STYLE = classNames('pointer-events-none');

export const RainbowTabButton = forwardRef<
  HTMLButtonElement,
  { disabled?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, disabled = false, ...props }, ref) => (
  <button
    ref={ref}
    className={classNames(
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
    className={classNames(
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
    className={classNames(
      TAB_STYLE,
      disabled && DISABLED_TAB_STYLE,
      typeof className === 'string' ? className : undefined
    )}
    {...props}
  >
    {children}
  </NavLink>
);

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof TradingButton>
>(({ children, intent, type, ...props }, ref) => {
  return (
    <TradingButton
      ref={ref}
      intent={intent || type === 'submit' ? Intent.Primary : Intent.None}
      type={type}
      {...props}
    >
      {children}
    </TradingButton>
  );
});
Button.displayName = 'TradingButton';
