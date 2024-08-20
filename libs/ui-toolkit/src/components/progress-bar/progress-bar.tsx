import { cn } from '../../utils/cn';
import { getIntentColor } from '../../utils/intent';
import { Intent } from '../../utils/intent';

interface ProgressBarProps {
  value?: number;
  intent?: Intent;
  className?: string;
  compact?: boolean;
}

export const ProgressBar = ({
  className,
  intent,
  value,
  compact,
}: ProgressBarProps) => {
  return (
    <div
      data-progress-bar
      style={{ height: compact ? '4px' : '6px' }}
      className={cn(
        'relative',
        {
          'bg-surface-2': !compact,
        },
        className
      )}
    >
      <div
        data-progress-bar-value
        className={cn(
          'absolute left-0 top-0 bottom-0',
          { 'rounded-sm': compact },
          intent === undefined || intent === Intent.None
            ? 'bg-surface-0'
            : getIntentColor(intent ?? Intent.None)
        )}
        style={{ width: `${Math.max(0, value ?? 0)}%` }}
      ></div>
    </div>
  );
};
