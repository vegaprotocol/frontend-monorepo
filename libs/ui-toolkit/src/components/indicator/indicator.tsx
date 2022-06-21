import classNames from 'classnames';
import { Intent } from '../../utils/intent';
import { getIntentBackground } from '../../utils/intent';

interface IndicatorProps {
  variant?: Intent;
}

export const Indicator = ({ variant = Intent.None }: IndicatorProps) => {
  const names = classNames(
    'inline-block w-8 h-8 mb-2 mr-8 rounded',
    getIntentBackground(variant)
  );
  return <div className={names} />;
};
