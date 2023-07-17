import classNames from 'classnames';
import { forwardRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { Intent } from '../../utils/intent';

type Size = 'large' | 'medium' | 'small';
export interface Props {
  size: Size;
  intent?: Intent;
  children?: ReactNode;
  icon?: ReactNode;
  subLabel?: ReactNode;
}

const getClassName = (
  { size, subLabel, intent }: Pick<Props, 'size' | 'subLabel' | 'intent'>,
  className?: string
) =>
  classNames(
    'flex items-center justify-center rounded',
    {
      'h-12': !subLabel && size === 'large',
      'h-10': !subLabel && (!size || size === 'medium'),
      'h-8': !subLabel && size === 'small',
      'bg-vega-yellow': intent === Intent.Primary,
      'bg-vega-cdark-500': intent === Intent.None,
      'bg-vega-blue-650': intent === Intent.Info,
      'bg-vega-orange-650': intent === Intent.Warning,
      'bg-vega-red-650': intent === Intent.Danger,
      'bg-vega-green-650': intent === Intent.Success,
      'text-vega-cdark-50': intent !== Intent.Primary,
      'text-vega-cdark-900': intent === Intent.Primary,
      'px-3 text-xs': !subLabel && size === 'small',
      'px-4 text-base': !subLabel && size !== 'small',
      'flex-col items-center justify-center px-3 pt-2.5 pb-2': subLabel,
    },
    className
  );

export interface TradingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Props {}

const Content = ({
  icon,
  subLabel,
  children,
}: Pick<Props, 'icon' | 'subLabel' | 'children'>) => (
  <>
    <span className="font-alpha text-base leading-none" key="children">
      {children}
    </span>
    {icon}
    {subLabel && (
      <span
        className="font-mono text-xs leading-tight mt-0.5 text-vega-cdark-100"
        key={'subLabel'}
      >
        {subLabel}
      </span>
    )}
  </>
);

export const TradingButton = forwardRef<HTMLButtonElement, TradingButtonProps>(
  (
    {
      size = 'medium',
      intent = Intent.None,
      type = 'button',
      icon,
      children,
      className,
      subLabel,
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={getClassName({ size, subLabel, intent }, className)}
    >
      <Content icon={icon} subLabel={subLabel} children={children} />
    </button>
  )
);

export interface TradingAnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    Props {}

export const TradingAnchorButton = forwardRef<
  HTMLAnchorElement,
  TradingAnchorButtonProps
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
