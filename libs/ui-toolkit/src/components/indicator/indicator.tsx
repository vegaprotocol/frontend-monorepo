import classNames from 'classnames';
import { Intent } from '../../utils/intent';
import { getIntentTextAndBackground } from '../../utils/intent';

interface IndicatorProps {
  variant?: Intent;
}

export const Indicator = ({ variant = Intent.None }: IndicatorProps) => {
  const names = classNames(
    'inline-block w-2 h-2 mt-1 mr-2 rounded-full',
    getIntentTextAndBackground(variant)
  );
  return <div className={names} data-testid="indicator" />;
};
