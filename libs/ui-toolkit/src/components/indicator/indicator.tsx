import { cn } from '@vegaprotocol/ui-toolkit';
import { getIntentBackground, getIntentText, Intent } from '../../utils/intent';

interface IndicatorProps {
  intent?: Intent;
  size?: 'md' | 'lg';
}

export const Indicator = ({
  intent = Intent.None,
  size = 'md',
}: IndicatorProps) => {
  const names = cn(
    'inline-block rounded-full',
    getIntentText(intent),
    getIntentBackground(intent),
    {
      'w-2 h-2': size === 'md',
      'w-3 h-3': size === 'lg',
    }
  );
  return <div className={names} data-testid="indicator" />;
};
