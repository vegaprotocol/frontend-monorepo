/* eslint-disable react/display-name */
import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type MarketSelectorButtonProps = {
  size?: 'large' | 'medium' | 'small' | 'extra-small';
  children?: ReactNode;
  icon?: ReactNode;
  fill?: boolean;
};

const getClassName = (
  { size, fill }: MarketSelectorButtonProps,
  className?: string
) =>
  classNames(
    'flex gap-2 items-center justify-center rounded disabled:opacity-40',
    // size
    {
      'h-12': size === 'large',
      'h-10': !size || size === 'medium',
      'h-8': size === 'small',
      'px-3 text-sm': size === 'small',
      'h-6 px-2 text-xs': size === 'extra-small',
      'px-4 text-base': size !== 'small',
    },
    // colours
    'bg-vega-clight-500 hover:bg-vega-clight-400 dark:bg-vega-cdark-500 dark:hover:bg-vega-cdark-400',
    // text
    'text-secondary',
    { 'w-full': fill },
    className
  );

const Content = ({ icon, children }: MarketSelectorButtonProps) => (
  <>
    <span data-label className="font-alpha leading-none" key="children">
      {children}
    </span>
    {icon}
  </>
);
export const MarketSelectorButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & MarketSelectorButtonProps
>(
  (
    {
      size = 'small',
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
      className={getClassName({ size, fill }, className)}
      {...props}
    >
      <Content icon={icon}>{children}</Content>
    </button>
  )
);
