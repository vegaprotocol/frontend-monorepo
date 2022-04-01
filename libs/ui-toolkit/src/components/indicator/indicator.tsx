import classNames from 'classnames';
import type { TailwindIntents } from '../../utils/intent';
import { getVariantBackground } from '../../utils/intent';

export const Indicator = ({ variant }: { variant?: TailwindIntents }) => {
  const names = classNames(
    'inline-block w-8 h-8 mb-2 mr-8 rounded',
    getVariantBackground(variant)
  );
  return <div className={names} />;
};
