import classNames from 'classnames';
import { Intent } from '../../utils/intent';
import { getVariantBackground } from '../../utils/intent';

interface IndicatorProps {
  variant?: Intent;
}

export const Indicator = ({ variant = Intent.None }: IndicatorProps) => {
  const names = classNames(
    'inline-block w-8 h-8 mb-2 mr-8 rounded',
    getVariantBackground(variant)
  );
  return <div className={names} />;
};
