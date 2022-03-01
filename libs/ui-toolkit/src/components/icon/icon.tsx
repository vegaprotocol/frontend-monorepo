import { IconSvgPaths20, IconSvgPaths16, IconName } from '@blueprintjs/icons';
import classNames from 'classnames';

interface IconProps {
  hasError?: boolean;
  disabled?: boolean;
  name: IconName;
  className?: string;
  size?: 16 | 20 | 24 | 32 | 48 | 64;
}

export const Icon = ({ size = 20, name, className }: IconProps) => {
  const effectiveClassName = classNames(
    {
      'w-20': size === 20,
      'h-20': size === 20,
    },
    className
  );
  const viewbox = size <= 16 ? '0 0 16 16' : '0 0 20 20';
  return (
    <svg className={effectiveClassName} viewBox={viewbox}>
      <g>
        {(size <= 16 ? IconSvgPaths16 : IconSvgPaths20)[name].map((d) => (
          <path fill-rule="evenodd" clip-rule="evenodd" d={d} />
        ))}
      </g>
    </svg>
  );
};

export default Icon;
