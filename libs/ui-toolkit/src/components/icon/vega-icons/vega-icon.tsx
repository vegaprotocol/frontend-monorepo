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
    'pr-1',
    'stroke-current'
  );
  const Element = VegaIconNameMap[name];
  return (
    <span className={effectiveClassName}>
      <Element size={size} />
    </span>
  );
};
