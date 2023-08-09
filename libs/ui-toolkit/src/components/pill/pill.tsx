import type { ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import classNames from 'classnames';

type Size = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
interface Props {
  children: ReactNode;
  intent?: Intent;
  size?: Size;
  className?: string;
}

const getClasses = (size: Size, intent?: Intent, className?: string) => {
  return classNames(
    ['rounded-md', 'leading-none', 'font-alpha', 'py-1 px-2'],
    {
      'bg-vega-yellow dark:bg-vega-yellow': intent === Intent.Primary,
      'bg-vega-clight-500 dark:bg-vega-cdark-500': intent === Intent.None,
      'bg-vega-blue-500 dark:bg-vega-blue-500': intent === Intent.Info,
      'bg-vega-orange-350 dark:bg-vega-orange-650': intent === Intent.Warning,
      'bg-vega-red-350 dark:bg-vega-red-650': intent === Intent.Danger,
      'bg-vega-green-350 dark:bg-vega-green-650': intent === Intent.Success,
      'text-vega-clight-50 dark:text-vega-cdark-50': intent !== Intent.Primary,
      'text-vega-clight-900 dark:text-vega-cdark-900':
        intent === Intent.Primary,
    },
    {
      'text-lg': size === 'lg',
      'text-base': size === 'md',
      'text-sma': size === 'sm',
      'text-xs': size === 'xs',
      'text-[10px]': size === 'xxs',
    },
    className
  );
};

export const Pill = ({ intent, size, className, children }: Props) => {
  return (
    <span className={getClasses(size || 'md', intent, className)}>
      {children}
    </span>
  );
};
