import classNames from 'classnames';
import { Intent } from '../../utils/intent';
import { getIntentTextAndBackground } from '../../utils/intent';

interface IndicatorProps {
  variant?: Intent;
  size?: 'md' | 'lg';
}

export const Indicator = ({
  variant = Intent.None,
  size = 'md',
}: IndicatorProps) => {
  const names = classNames(
    'inline-block rounded-full',
    getIntentTextAndBackground(variant),
    {
      'w-2 h-2': size === 'md',
      'w-3 h-3': size === 'lg',
    }
  );
  return <div className={names} data-testid="indicator" />;
};
