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
      data-progress-bar
      style={{ height: '6px' }}
      className={classNames(
        'bg-neutral-300 dark:bg-neutral-700 relative',
        className
      )}
    >
      <div
        data-progress-bar-value
        className={classNames(
          'absolute left-0 top-0 bottom-0',
          intent === undefined || intent === Intent.None
            ? 'bg-neutral-600 dark:bg-white'
            : getIntentBackground(intent ?? Intent.None)
        )}
        style={{ width: `${Math.max(0, value ?? 0)}%` }}
      ></div>
    </div>
  );
};
