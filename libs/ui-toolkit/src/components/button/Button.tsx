import classNames from 'classnames';
import { Icon, IconName } from '../icon';
export interface ButtonProps {
  tag?: 'a' | 'button';
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> &
    React.MouseEventHandler<HTMLAnchorElement>;
  variant?: 'primary' | 'secondary' | 'accent' | 'inline';
  disabled?: boolean;
  className?: string;
  prependIconName?: IconName;
  appendIconName?: IconName;
}

export function Button({
  tag = 'button',
  variant = 'primary',
  children,
  onClick,
  disabled,
  className,
  prependIconName,
  appendIconName,
}: ButtonProps) {
  const ButtonTag: keyof JSX.IntrinsicElements = tag;
  const effectiveClassName = classNames(
    [
      'inline-flex',
      'items-center',
      'justify-center',
      'box-border',
      'h-28',
      'border',
      'text-ui',
      'no-underline',
      'hover:underline',
      'hover:border-white',
      'active:border-white',
      'disabled:no-underline',
      'disabled:bg-disabled/25',
    ],
    {
      'pl-28': !(
        className?.match(/(^| )p(l|x)-\d+( |$)/) || variant === 'inline'
      ),
      'pr-28': !(
        className?.match(/(^| )p(r|x)-\d+( |$)/) || variant === 'inline'
      ),

      'bg-white': variant === 'primary',
      'border-light-gray-50': variant === 'primary' || variant === 'secondary',
      'text-black': variant === 'primary',
      'hover:bg-white/70': variant === 'primary',
      'active:bg-black': variant === 'primary' || variant === 'accent',
      'active:text-white': variant === 'primary',
      'disabled:text-gray-50': variant === 'primary' || variant === 'secondary',
      'disabled:border-neutral-593': variant === 'primary',

      'bg-black': variant === 'secondary',
      'text-light-gray-50': variant === 'secondary' || variant === 'inline',
      'hover:bg-white/30': variant === 'secondary',
      'hover:text-white': variant === 'secondary' || variant === 'accent',
      'active:bg-white': variant === 'secondary',
      'active:text-black': variant === 'secondary',
      'disabled:text-disabled': variant === 'secondary' || variant === 'accent',
      'disabled:border-disabled':
        variant === 'secondary' || variant === 'accent',

      uppercase: variant === 'accent',
      'bg-vega-yellow': variant === 'accent',
      'border-transparent': variant === 'accent' || variant === 'inline',
      'hover:bg-vega-yellow/30': variant === 'accent',
      'active:text-light-gray-50': variant === 'accent',

      'pl-4': variant === 'inline',
      'pr-4': variant === 'inline',
      'border-0': variant === 'inline',
      underline: variant === 'inline',
      'hover:no-underline': variant === 'inline',
      'hover:border-transparent': variant === 'inline',
      'active:border-transparent': variant === 'inline',
      'active:text-vega-yellow': variant === 'inline',
    },
    className
  );
  let icon;
  const iconName = prependIconName || appendIconName;
  if (iconName !== undefined) {
    const iconClassName = classNames(['fill-current'], {
      'mr-8': prependIconName,
      'ml-8': appendIconName,
    });
    icon = <Icon name={iconName} className={iconClassName} size={16} />;
  }
  return (
    <ButtonTag
      onClick={onClick}
      className={effectiveClassName}
      disabled={disabled}
    >
      {prependIconName && icon}
      {children}
      {appendIconName && icon}
    </ButtonTag>
  );
}
