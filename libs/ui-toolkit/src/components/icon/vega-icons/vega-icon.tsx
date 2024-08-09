import { cn } from '../../../utils/cn';

import type { VegaIconNames } from './vega-icon-record';
import { VegaIconNameMap } from './vega-icon-record';

export type VegaIconSize = 8 | 10 | 12 | 13 | 14 | 16 | 18 | 20 | 24 | 28 | 32;

export interface VegaIconProps {
  name: VegaIconNames;
  size?: VegaIconSize;
  className?: string;
}

export const VegaIcon = ({ size = 16, name, className }: VegaIconProps) => {
  const effectiveClassName = cn(
    'inline-block',
    'align-text-bottom',
    'fill-current stroke-none',
    className
  );
  const Element = VegaIconNameMap[name];
  return (
    <span className={effectiveClassName} data-testid={`icon-${name}`}>
      <Element size={size} />
    </span>
  );
};
