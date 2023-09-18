import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ComponentProps, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

type RainbowButtonProps = {
  variant?: 'full' | 'border';
};

export const RainbowButton = ({
  variant = 'full',
  children,
  className,
  ...props
}: RainbowButtonProps & HTMLAttributes<HTMLButtonElement>) => (
  <button
    className={classNames(
      'bg-rainbow hover:bg-none hover:bg-vega-pink-500 rounded-lg overflow-hidden',
      {
        'px-5 py-3 text-white': variant === 'full',
        'p-[0.125rem]': variant === 'border',
      },
      className
    )}
    {...props}
  >
    <div
      className={classNames({
        'bg-white dark:bg-vega-cdark-900 text-black dark:text-white px-5 py-3 rounded-[0.35rem] overflow-hidden':
          variant === 'border',
      })}
    >
      {children}
    </div>
  </button>
);

const RAINBOW_TAB_STYLE = classNames(
  'inline-block',
  'bg-vega-clight-500 dark:bg-vega-cdark-500 hover:bg-vega-clight-400 dark:hover:bg-vega-cdark-400',
  'data-[state="active"]:text-white data-[state="active"]:bg-rainbow data-[state="active"]:hover:bg-none data-[state="active"]:hover:bg-vega-pink-500 dark:data-[state="active"]:hover:bg-vega-pink-500',
  '[&.active]:text-white [&.active]:bg-rainbow [&.active]:hover:bg-none [&.active]:hover:bg-vega-pink-500 dark:[&.active]:hover:bg-vega-pink-500',
  'px-5 py-3',
  'first:rounded-tl-lg last:rounded-tr-lg'
);

export const RainbowTabButton = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} className={RAINBOW_TAB_STYLE} {...props}>
    {children}
  </button>
));
RainbowTabButton.displayName = 'RainbowTabButton';

export const RainbowTabLink = ({
  to,
  children,
  ...props
}: ComponentProps<typeof NavLink>) => (
  <NavLink to={to} className={RAINBOW_TAB_STYLE} {...props}>
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
