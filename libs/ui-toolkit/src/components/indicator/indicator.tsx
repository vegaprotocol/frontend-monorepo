import classNames from 'classnames';
import type { Variant } from '../../utils/intent';
import { getVariantBackground } from '../../utils/intent';

export const Indicator = ({ variant }: { variant?: Variant }) => {
  const names = classNames(
    'inline-block w-8 h-8 mb-2 mr-8 rounded',
    getVariantBackground(variant)
  );
  return <div className={names} />;
};
