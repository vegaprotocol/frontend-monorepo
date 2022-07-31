import classNames from 'classnames';
import { getIntentBackground } from '../../utils/intent';
import { Intent } from '../../utils/intent';

interface ProgressBarProps {
  value?: number;
  intent?: Intent;
  className?: string;
}

export const ProgressBar = ({ className, intent, value }: ProgressBarProps) => {
  return (
    <div
      style={{ height: '6px' }}
      className={classNames('bg-black-10 relative', className)}
    >
      <div
        className={classNames(
          'absolute left-0 top-0 bottom-0',
          intent === undefined || intent === Intent.None
            ? 'bg-black-60'
            : getIntentBackground(intent ?? Intent.None)
        )}
        style={{ width: `${Math.max(0, value ?? 0)}%` }}
      ></div>
    </div>
  );
};
