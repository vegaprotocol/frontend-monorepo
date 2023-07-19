import classNames from 'classnames';
import { forwardRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { Intent } from '../../utils/intent';

type TradingButtonProps = {
  size: 'large' | 'medium' | 'small';
  intent?: Intent;
  children?: ReactNode;
  icon?: ReactNode;
  subLabel?: ReactNode;
};

const getClassName = (
  {
    size,
    subLabel,
    intent,
  }: Pick<TradingButtonProps, 'size' | 'subLabel' | 'intent'>,
  className?: string
) =>
  classNames(
    'flex items-center justify-center rounded',
    // size
    {
      'h-12': !subLabel && size === 'large',
      'h-10': !subLabel && (!size || size === 'medium'),
      'h-8': !subLabel && size === 'small',
      'px-3 text-sm': !subLabel && size === 'small',
      'px-4 text-base': !subLabel && size !== 'small',
      'flex-col items-center justify-center px-3 pt-2.5 pb-2': subLabel,
    },
    // colours
    {
      'bg-vega-yellow dark:bg-vega-yellow': intent === Intent.Primary,
      'bg-vega-clight-500 dark:bg-vega-cdark-500': intent === Intent.None,
      'bg-vega-blue-350 dark:bg-vega-blue-650': intent === Intent.Info,
      'bg-vega-orange-350 dark:bg-vega-orange-650': intent === Intent.Warning,
      'bg-vega-red-350 dark:bg-vega-red-650': intent === Intent.Danger,
      'bg-vega-green-350 dark:bg-vega-green-650': intent === Intent.Success,
      'text-vega-clight-50 dark:text-vega-cdark-50': intent !== Intent.Primary,
      'text-vega-clight-900 dark:text-vega-cdark-900':
        intent === Intent.Primary,
    },
    // text
    {
      'text-vega-clight-50 dark:text-vega-cdark-50': intent !== Intent.Primary,
      '!text-vega-clight-50': intent === Intent.Primary,
      'text-vega-clight-100 dark:text-vega-cdark-100':
        intent === Intent.Primary,
      '[&_[data-sub-label]]:text-vega-clight-100': intent === Intent.Primary,
    },
    className
  );

const Content = ({
  icon,
  subLabel,
  children,
}: Pick<TradingButtonProps, 'icon' | 'subLabel' | 'children'>) => (
  <>
    <span data-label className="font-alpha leading-none" key="children">
      {children}
    </span>
    {icon}
    {subLabel && (
      <span
        data-sub-label
        className="font-mono text-xs leading-tight mt-0.5"
        key="trading-button-sub-label"
      >
        {subLabel}
      </span>
    )}
  </>
);

export const TradingButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & TradingButtonProps
>(
  (
    {
      size = 'medium',
      intent = Intent.None,
      type = 'button',
      icon,
      children,
      className,
      subLabel,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-trading-button
      className={getClassName({ size, subLabel, intent }, className)}
      {...props}
    >
      <Content icon={icon} subLabel={subLabel} children={children} />
    </button>
  )
);

export const TradingAnchorButton = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & TradingButtonProps
>(
  (
    {
      size = 'medium',
      intent = Intent.None,
      icon,
      href,
      children,
      className,
      subLabel,
    },
    ref
  ) => (
    <a
      ref={ref}
      href={href}
      className={getClassName({ size, subLabel, intent }, className)}
    >
      <Content icon={icon} subLabel={subLabel} children={children} />
    </a>
  )
);
