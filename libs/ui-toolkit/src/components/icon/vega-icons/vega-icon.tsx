import classNames from 'classnames';
import type { VegaIconNames } from './svg';
import { VegaIconNameMap } from './svg';
export * from './vega-icon';

export interface VegaIconProps {
  name: VegaIconNames;
  className?: string;
  size?: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16;
  ariaLabel?: string;
}

export const VegaIcon = ({
  size = 4,
  name,
  className,
  ariaLabel,
}: VegaIconProps) => {
  const effectiveClassName = classNames(
    'inline-block',
    'fill-current',
    'align-text-bottom',
    'fill-current',
    'shrink-0',
    {
      'w-2 h-2': size === 2,
      'w-3 h-3': size === 3,
      'w-4 h-4': size === 4,
      'w-6 h-6': size === 6,
      'w-8 h-8': size === 8,
      'w-10 h-10': size === 10,
      'w-12 h-12': size === 12,
      'w-14 h-14': size === 14,
      'w-16 h-16': size === 16,
    },
    className
  );
  return (
    <img
      src={VegaIconNameMap[name]}
      alt={`icon-${name}`}
      aria-label={ariaLabel || `${name} icon`}
      className={effectiveClassName}
    />
  );
};
