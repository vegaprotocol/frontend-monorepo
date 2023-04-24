import type { IconName } from '@blueprintjs/icons';
import { IconSvgPaths20, IconSvgPaths16 } from '@blueprintjs/icons';
import classNames from 'classnames';

export type { IconName } from '@blueprintjs/icons';

export interface IconProps {
  name: IconName;
  className?: string;
  size?: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16;
  ariaLabel?: string;
}

export const Icon = ({ size = 4, name, className, ariaLabel }: IconProps) => {
  const effectiveClassName = classNames(
    'inline-block',
    'fill-current',
    'align-text-bottom',
    'shrink-0',
    // Cant just concatenate as TW wont pick up that the class is being used
    // so below syntax is required
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
  const viewbox = size <= 12 ? '0 0 16 16' : '0 0 20 20';
  return (
    // For more information on accessibility for svg see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/img_role#svg_and_roleimg
    <svg
      role="img"
      aria-label={ariaLabel || `${name} icon`}
      className={effectiveClassName}
      viewBox={viewbox}
    >
      {(size <= 16 ? IconSvgPaths16 : IconSvgPaths20)[name].map((d, key) => (
        <path fillRule="evenodd" clipRule="evenodd" d={d} key={key} />
      ))}
    </svg>
  );
};
