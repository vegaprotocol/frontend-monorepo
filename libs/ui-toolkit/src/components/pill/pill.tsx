import type { ReactNode, HTMLProps } from 'react';
import { Intent } from '../../utils/intent';
import { cn } from '../../utils/cn';

type Size = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
interface Props extends Omit<HTMLProps<HTMLSpanElement>, 'size'> {
  children: ReactNode;
  intent?: Intent;
  size?: Size;
  className?: string;
}

// TODO: update to use intent colors
const getClasses = (size: Size, intent: Intent, className?: string) => {
  return cn(
    'rounded-sm leading-none flex-inline items-center',
    {
      'bg-vega-yellow dark:bg-vega-yellow': intent === Intent.Primary,
      'bg-gs-300 dark:bg-gs-700': intent === Intent.None,
      'bg-vega-blue-500 dark:bg-vega-blue-500': intent === Intent.Info,
      'bg-vega-orange-350 dark:bg-vega-orange-650': intent === Intent.Warning,
      'bg-vega-red-350 dark:bg-vega-red-650': intent === Intent.Danger,
      'bg-vega-green-350 dark:bg-vega-green-650': intent === Intent.Success,
    },
    {
      'text-lg py-1 px-2': size === 'lg',
      'text-base py-1 px-2': size === 'md',
      'text-sm py-1 px-1': size === 'sm',
      'text-xs py-1 px-1': size === 'xs',
      'text-[10px] py-0 px-1': size === 'xxs',
    },
    className
  );
};

export const Pill = ({
  intent,
  size,
  className,
  children,
  ...props
}: Props) => {
  return (
    <span
      className={getClasses(size || 'md', intent || Intent.None, className)}
      data-testid="pill"
      {...props}
    >
      {children}
    </span>
  );
};
