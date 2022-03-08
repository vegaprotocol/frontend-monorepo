import { IconSvgPaths20, IconSvgPaths16, IconName } from '@blueprintjs/icons';
import classNames from 'classnames';

export type { IconName } from '@blueprintjs/icons';

interface IconProps {
  name: IconName;
  className?: string;
  size?: 16 | 20 | 24 | 32 | 48 | 64;
}

export const Icon = ({ size = 16, name, className }: IconProps) => {
  const effectiveClassName = classNames(
    {
      'w-20': size === 20,
      'h-20': size === 20,
      'w-16': size === 16,
      'h-16': size === 16,
    },
    className
  );
  const viewbox = size <= 16 ? '0 0 16 16' : '0 0 20 20';
  return (
    <svg className={effectiveClassName} viewBox={viewbox}>
      {(size <= 16 ? IconSvgPaths16 : IconSvgPaths20)[name].map((d, key) => (
        <path fillRule="evenodd" clipRule="evenodd" d={d} key={key} />
      ))}
    </svg>
  );
};
