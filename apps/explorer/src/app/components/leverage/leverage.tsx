import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { LeverageTooltip } from './leverage-tooltip';

export type LeverageProps = {
  marginFactor?: string;
  className?: string;
};

/**
 * Calculates leverage, given a margin factor, protecting for 0 or null
 * or infinity
 * @returns React component
 */
export function Leverage({ marginFactor, className = '' }: LeverageProps) {
  if (!marginFactor || parseFloat(marginFactor) === 0) {
    return null;
  }

  BigNumber.config({ DECIMAL_PLACES: 2 });

  const leverage = BigNumber(1).dividedBy(BigNumber(marginFactor)).toString();

  if (leverage === 'Infinity' || leverage.indexOf('e+') !== -1) {
    return null;
  }

  return (
    <Tooltip
      description={
        <LeverageTooltip marginFactor={marginFactor} leverage={leverage} />
      }
    >
      <span className={`${className} decoration-dotted underline`}>
        {leverage}&times;
      </span>
    </Tooltip>
  );
}
