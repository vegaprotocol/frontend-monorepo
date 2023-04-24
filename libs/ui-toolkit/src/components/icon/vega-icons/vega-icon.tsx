import classNames from 'classnames';

import type { VegaIconNames } from './vega-icon-record';
import { VegaIconNameMap } from './vega-icon-record';

export interface VegaIconProps {
  name: VegaIconNames;
  size?: 16 | 24 | 32;
}

export const VegaIcon = ({ size = 16, name }: VegaIconProps) => {
  const effectiveClassName = classNames(
    'inline-block',
    'fill-current',
    'align-text-bottom',
    'fill-current',
    'shrink-0',
    'pr-1'
  );
  const Element = VegaIconNameMap[name];
  return (
    <span className={effectiveClassName}>
      <Element size={size} />
    </span>
  );
};
