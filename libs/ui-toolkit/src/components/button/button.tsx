import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  forwardRef,
} from 'react';
import classNames from 'classnames';
import { Icon, IconName } from '../icon';

interface CommonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'inline';
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
}
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {}

export interface AnchorButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

const getClassName = (
  className: CommonProps['className'],
  variant: CommonProps['variant']
) =>
  classNames(
    [
      'inline-flex',
      'items-center',
      'justify-center',
      // 'bg-clip-padding',
      'box-border',
      'h-28',
      'border',
      'text-ui',
      'no-underline',
      'hover:underline',
      'disabled:no-underline',
      'transition-all',
    ],
    {
      'pl-28': !(
        className?.match(/(^| )p(l|x)-\d+( |$)/) || variant === 'inline'
      ),
      'pr-28': !(
        className?.match(/(^| )p(r|x)-\d+( |$)/) || variant === 'inline'
      ),

      'hover:border-black dark:hover:border-white': variant !== 'inline',
      'active:border-black dark:active:border-white': true,

      'bg-black dark:bg-white': variant === 'primary',
      'border-black/60 dark:border-white/60':
        variant === 'primary' || variant === 'secondary',
      'text-white dark:text-black': variant === 'primary',
      'hover:bg-black/80 dark:hover:bg-white/80': variant === 'primary',
      'active:bg-white dark:active:bg-black':
        variant === 'primary' || variant === 'accent',
      'active:text-black dark:active:text-white':
        variant === 'primary' || variant === 'accent',

      'bg-white dark:bg-black': variant === 'secondary',
      'text-black dark:text-white': variant === 'secondary',
      'hover:bg-black/25 dark:hover:bg-white/25': variant === 'secondary',
      'hover:text-black dark:hover:text-white':
        variant === 'secondary' || variant === 'accent',
      'active:bg-black dark:active:bg-white': variant === 'secondary',
      'active:text-white dark:active:text-black': variant === 'secondary',

      uppercase: variant === 'accent',
      'bg-vega-yellow dark:bg-vega-yellow': variant === 'accent',
      'border-transparent dark:border-transparent':
        variant === 'accent' || variant === 'inline',
      'hover:bg-vega-yellow-dark dark:hover:bg-vega-yellow/30':
        variant === 'accent',
      'hover:text-white dark:hover:text-white': variant === 'accent',

      'pl-4': variant === 'inline',
      'pr-4': variant === 'inline',
      'border-0': variant === 'inline',
      underline: variant === 'inline',
      'hover:no-underline': variant === 'inline',
      'hover:border-transparent dark:hover:border-transparent':
        variant === 'inline',
      'active:border-transparent dark:active:border-transparent':
        variant === 'inline',
      'active:text-black dark:active:text-vega-yellow': variant === 'inline',
      'text-black/95 dark:text-white/95': variant === 'inline',
      'hover:text-black hover:dark:text-white': variant === 'inline',

      'disabled:bg-black/10 dark:disabled:bg-white/10': variant !== 'inline',
      'disabled:text-black/60 dark:disabled:text-white/60':
        variant !== 'inline',
      'disabled:border-black/25 dark:disabled:border-white/25':
        variant !== 'inline',
    },
    className
  );

const getContent = (
  children: React.ReactNode,
  prependIconName?: IconName,
  appendIconName?: IconName
) => {
  const iconName = prependIconName || appendIconName;
  if (iconName === undefined) {
    return children;
  }
  const iconClassName = classNames(['fill-current'], {
    'mr-8': prependIconName,
    'ml-8': appendIconName,
  });
  const icon = <Icon name={iconName} className={iconClassName} size={16} />;
  return (
    <>
      {prependIconName && icon}
      {children}
      {appendIconName && icon}
    </>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      children,
      className,
      prependIconName,
      appendIconName,
      ...prosp
    },
    ref
  ) => {
    return (
      <button ref={ref} className={getClassName(className, variant)} {...prosp}>
        {getContent(children, prependIconName, appendIconName)}
      </button>
    );
  }
);

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  (
    {
      variant = 'primary',
      children,
      className,
      prependIconName,
      appendIconName,
      ...prosp
    },
    ref
  ) => {
    return (
      <a ref={ref} className={getClassName(className, variant)} {...prosp}>
        {getContent(children, prependIconName, appendIconName)}
      </a>
    );
  }
);
