import classNames from 'classnames';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { Intent } from '../../utils/intent';
import { Link } from 'react-router-dom';

type TradingButtonProps = {
  size?: 'large' | 'medium' | 'small' | 'extra-small';
  intent?: Intent;
  children?: ReactNode;
  icon?: ReactNode;
  subLabel?: ReactNode;
  fill?: boolean;
};

const getClassName = (
  {
    size,
    subLabel,
    intent,
    fill,
  }: Pick<TradingButtonProps, 'size' | 'subLabel' | 'intent' | 'fill'>,
  className?: string
) =>
  classNames(
    'flex gap-2 items-center justify-center rounded disabled:opacity-40',
    // size
    {
      'h-12': !subLabel && size === 'large',
      'h-10': !subLabel && (!size || size === 'medium'),
      'h-8': !subLabel && size === 'small',
      'px-3 text-sm': !subLabel && size === 'small',
      'h-6 px-2 text-xs': !subLabel && size === 'extra-small',
      'px-4 text-base': !subLabel && size !== 'small',
      'flex-col items-center justify-center px-3 pt-2.5 pb-2': subLabel,
    },
    // colours
    {
      'bg-vega-yellow enabled:hover:bg-vega-yellow-550 dark:bg-vega-yellow dark:enabled:hover:bg-vega-yellow-450':
        intent === Intent.Primary,
      'bg-vega-clight-500 enabled:hover:bg-vega-clight-400 dark:bg-vega-cdark-500 dark:enabled:hover:bg-vega-cdark-400':
        intent === Intent.None,
      'bg-vega-blue-350 enabled:hover:bg-vega-blue-400 dark:bg-vega-blue-650 dark:enabled:hover:bg-vega-blue-600':
        intent === Intent.Info,
      'bg-vega-orange-350 enabled:hover:bg-vega-orange-400 dark:bg-vega-orange-650 dark:enabled:hover:bg-vega-orange-600':
        intent === Intent.Warning,
      'bg-vega-red-350 enabled:hover:bg-vega-red-400 dark:bg-vega-red-650 dark:enabled:hover:bg-vega-red-600':
        intent === Intent.Danger,
      'bg-vega-green-350 enabled:hover:bg-vega-green-400 dark:bg-vega-green-650 dark:enabled:hover:bg-vega-green-600':
        intent === Intent.Success,
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
    { 'w-full': fill },
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
        className="mt-0.5 font-mono text-xs leading-tight"
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
      fill,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-trading-button
      className={getClassName({ size, subLabel, intent, fill }, className)}
      {...props}
    >
      <Content icon={icon} subLabel={subLabel} children={children} />
    </button>
  )
);

export const TradingAnchorButton = ({
  size = 'medium',
  intent = Intent.None,
  icon,
  href,
  children,
  className,
  subLabel,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  TradingButtonProps & { href: string }) => (
  <Link
    to={href}
    className={getClassName({ size, subLabel, intent }, className)}
    {...props}
  >
    <Content icon={icon} subLabel={subLabel} children={children} />
  </Link>
);
