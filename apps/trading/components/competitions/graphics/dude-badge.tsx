import classNames from 'classnames';
import { DudeWithFlag } from './dude-with-flag';

/**
 * Pre-defined badge gradients
 */

export const BADGE_GRADIENT_VARIANT_A =
  'bg-gradient-to-r from-vega-blue-500 via-vega-purple-500 to-vega-pink-500';
export const BADGE_GRADIENT_VARIANT_B =
  'bg-gradient-to-r from-vega-purple-500 via-vega-green-500 to-vega-blue-500';
export const BADGE_GRADIENT_VARIANT_C =
  'bg-gradient-to-r from-vega-blue-500 via-vega-purple-500 to-vega-green-500';

/** Badge */

export const DudeBadge = ({
  variant,
  className,
}: {
  variant: 'A' | 'B' | 'C' | undefined;
  className?: classNames.Argument;
}) => {
  return (
    <div
      className={classNames(
        'w-24 h-24 rounded-full bg-black relative',
        'rotate-12',
        {
          [BADGE_GRADIENT_VARIANT_A]: variant === 'A',
          [BADGE_GRADIENT_VARIANT_B]: variant === 'B',
          [BADGE_GRADIENT_VARIANT_C]: variant === 'C',
        },
        className
      )}
    >
      <DudeWithFlag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12" />
    </div>
  );
};
