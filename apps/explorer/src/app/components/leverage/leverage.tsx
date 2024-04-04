import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { LeverageTooltip } from './leverage-tooltip';

// Beyond this number, the component does not render because it's probably bad data
// More than 500x would already be unreasonable.
export const REASONABLE_LIMIT = 1001;

export type LeverageProps = {
  marginFactor?: string;
  className?: string;
};

/**
 * Calculates leverage, given a margin factor, protecting for 0 or null
 * or infinity. Uses BigNumber, probably unnecessarily
 *
 * @returns React component
 */
export function Leverage({ marginFactor, className = '' }: LeverageProps) {
  if (!marginFactor || parseFloat(marginFactor) === 0) {
    return null;
  }

  const leverage = BigNumber(1).dividedBy(BigNumber(marginFactor));

  if (
    !leverage.isFinite() ||
    leverage.isGreaterThanOrEqualTo(REASONABLE_LIMIT)
  ) {
    return null;
  }

  // Conversion here to remove insignificant 0s
  const label = +leverage.toFixed(2);

  return (
    <Tooltip
      description={
        <LeverageTooltip marginFactor={marginFactor} leverage={label} />
      }
    >
      <span className={`${className} decoration-dotted underline`}>
        {label}&times;
      </span>
    </Tooltip>
  );
}
