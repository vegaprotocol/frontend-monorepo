import classNames from 'classnames';
import { getIntentTextAndBackground } from '../../utils/intent';
import { Intent } from '../../utils/intent';

interface ProgressBarProps {
  value?: number;
  variant?: Intent;
  className?: string;
}

export const ProgressBar = ({
  className,
  variant,
  value,
}: ProgressBarProps) => {
  return (
    <div
      style={{ height: '6px' }}
      className={classNames('bg-white-muted relative', className)}
    >
      <div
        className={classNames(
          'absolute left-0 top-0 bottom-0',
          getIntentTextAndBackground(variant ?? Intent.None)
        )}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
