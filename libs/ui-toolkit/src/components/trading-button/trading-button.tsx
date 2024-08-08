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
  size?: 'large' | 'medium' | 'small' | 'extra-small' | 'custom';
  intent?: Intent | null;
  children?: ReactNode;
  icon?: ReactNode;
  fill?: boolean;
  minimal?: boolean;
  testId?: string;
};

const getClassName = (
  {
    size,
    intent,
    fill,
    minimal,
  }: Pick<TradingButtonProps, 'size' | 'intent' | 'fill' | 'minimal'>,
  className?: string
) =>
  classNames(
    'flex gap-2 items-center justify-center rounded disabled:opacity-40',
    // size
    {
      'h-12 rounded-lg': size === 'large',
      'h-10': !size || size === 'medium',
      'h-8': size === 'small',
      'px-3 text-sm': size === 'small',
      'h-6 px-2 text-xs': size === 'extra-small',
      'text-base': size !== 'small' && size !== 'custom',
      'px-4': size !== 'small' && size !== 'extra-small' && size !== 'custom',
    },
    // colours
    {
      'bg-vega-yellow enabled:hover:bg-vega-yellow-550 dark:bg-vega-yellow dark:enabled:hover:bg-vega-yellow-450':
        intent === Intent.Primary && !minimal,
      'bg-gs-500 enabled:hover:bg-gs-400': intent === Intent.None && !minimal,
      'bg-vega-blue-350 enabled:hover:bg-vega-blue-400 dark:bg-vega-blue-650 dark:enabled:hover:bg-vega-blue-600':
        intent === Intent.Info && !minimal,
      'bg-vega-orange-350 enabled:hover:bg-vega-orange-400 dark:bg-vega-orange-650 dark:enabled:hover:bg-vega-orange-600':
        intent === Intent.Warning && !minimal,
      'bg-vega-red-350 enabled:hover:bg-vega-red-400 dark:bg-vega-red-650 dark:enabled:hover:bg-vega-red-600':
        intent === Intent.Danger && !minimal,
      'bg-vega-green-350 enabled:hover:bg-vega-green-400 dark:bg-vega-green-650 dark:enabled:hover:bg-vega-green-600':
        intent === Intent.Success && !minimal,
      'bg-vega-blue-500 enabled:hover:bg-vega-blue-600':
        intent === Intent.Secondary && !minimal,
      // Minimal button
      'bg-transparent enabled:hover:bg-vega-yellow-550 dark:enabled:hover:bg-vega-yellow-450':
        intent === Intent.Primary && minimal,
      'bg-transparent enabled:hover:bg-gs-400':
        intent === Intent.None && minimal,
      'bg-transparent enabled:hover:bg-vega-blue-400 dark:enabled:hover:bg-vega-blue-600':
        intent === Intent.Info && minimal,
      'bg-transparent enabled:hover:bg-vega-orange-400 dark:enabled:hover:bg-vega-orange-600':
        intent === Intent.Warning && minimal,
      'bg-transparent enabled:hover:bg-vega-red-400 dark:enabled:hover:bg-vega-red-600':
        intent === Intent.Danger && minimal,
      'bg-transparent enabled:hover:bg-vega-green-400 dark:enabled:hover:bg-vega-green-600':
        intent === Intent.Success && minimal,
      'bg-transparent enabled:hover:bg-vega-blue-500 dark:enabled:hover:bg-vega-blue-600':
        intent === Intent.Secondary && minimal,
    },
    // text
    {
      'text-gs-50':
        (intent !== Intent.Primary && intent !== Intent.Secondary) || minimal,

      // If its primary the text must always be dark enough for a yellow background
      'text-black': intent === Intent.Primary && !minimal,
      // If its secondary the text must always be light enough for a blue background
      'text-white': intent === Intent.Secondary && !minimal,

      'enabled:hover:text-black': intent === Intent.Primary && minimal,
      'enabled:hover:text-white': intent === Intent.Secondary && minimal,

      '[&_[data-sub-label]]:text-gs-100': intent === Intent.Primary,
    },
    { 'w-full': fill },
    className
  );

const Content = ({
  icon,
  children,
}: Pick<TradingButtonProps, 'icon' | 'children'>) => (
  <>
    <span data-label className="font-alpha leading-none" key="children">
      {children}
    </span>
    {icon}
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
      minimal = false,
      icon,
      children,
      className,
      fill,
      testId,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-trading-button
      className={getClassName({ size, intent, fill, minimal }, className)}
      data-testid={testId}
      {...props}
    >
      <Content icon={icon} children={children} />
    </button>
  )
);

export const TradingAnchorButton = ({
  size = 'medium',
  intent = Intent.None,
  minimal = false,
  icon,
  href,
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  TradingButtonProps & { href: string }) => (
  <Link
    to={href}
    className={getClassName({ size, intent, minimal }, className)}
    {...props}
  >
    <Content icon={icon} children={children} />
  </Link>
);
