import { cn } from '@vegaprotocol/ui-toolkit';
import { DudeWithFlag } from './dude-with-flag';

/**
 * Pre-defined badge gradients
 */

export const BADGE_GRADIENT_VARIANT_A =
  'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500';
export const BADGE_GRADIENT_VARIANT_B =
  'bg-gradient-to-r from-purple-500 via-green-500 to-blue-500';
export const BADGE_GRADIENT_VARIANT_C =
  'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500';

/** Badge */

export const DudeBadge = ({
  variant,
  className,
}: {
  variant: 'A' | 'B' | 'C' | undefined;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'w-24 h-24 rounded-full bg-surface-2 relative',
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
