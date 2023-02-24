import { t } from '@vegaprotocol/utils';

import type { components } from '../../../../../types/explorer';
import type { LiquiditySubmission } from '../tx-liquidity-submission';
import { TableRow } from '../../../table';
import { LiquidityProvisionMid } from './components/liquidity-provision-mid';
import { LiquidityProvisionDetailsRow } from './components/liquidity-provision-details-row';
import { Side } from '@vegaprotocol/types';

export type VegaPeggedReference = components['schemas']['vegaPeggedReference'];

export type LiquidityProvisionOrder =
  components['schemas']['vegaLiquidityOrder'];

export const LiquidityReferenceLabel: Record<VegaPeggedReference, string> = {
  PEGGED_REFERENCE_BEST_ASK: t('Best Ask'),
  PEGGED_REFERENCE_BEST_BID: t('Best Bid'),
  PEGGED_REFERENCE_MID: t('Mid'),
  PEGGED_REFERENCE_UNSPECIFIED: '-',
};

/**
 * Given a side of a liquidity provision order, returns the total
 * It should be 100%, but it isn't always and if it isn't the proportion
 * reported for each order should be scaled
 *
 * @returns number
 */
export function sumProportions(
  side: LiquiditySubmission['buys'] | LiquiditySubmission['sells']
): number {
  if (!side || side.length === 0) {
    return 0;
  }

  return side.reduce((total, o) => total + (o.proportion || 0), 0);
}

export type LiquidityProvisionDetailsProps = {
  provision: LiquiditySubmission;
};

/**
 * Renders a table displaying all buys and sells in this LP. It is valid for there
 * to be no buys or sells.
 *
 * It might seem logical to turn proportions in to values based on the total commitment
 * but based on the current API structure it is awkward, and given that non-LP orders
 * will change the amount that is actually deployed vs assigned to a level, we decided
 * not to bother going down that route.
 */
export function LiquidityProvisionDetails({
  provision,
}: LiquidityProvisionDetailsProps) {
  if (!provision.buys?.length && !provision.sells?.length) {
    return null;
  }
  // We need to do some additional calcs if these aren't both 100
  const buyTotal = sumProportions(provision.buys);
  const sellTotal = sumProportions(provision.sells);

  return (
    <table>
      <thead>
        <TableRow modifier="bordered">
          <th className="px-2 pb-1">{t('Price offset')}</th>
          <th className="px-2 pb-1">{t('Price reference')}</th>
          <th className="px-2 pb-1">{t('Proportion')}</th>
        </TableRow>
      </thead>
      <tbody>
        {provision.buys?.map((b, i) => (
          <LiquidityProvisionDetailsRow
            order={b}
            marketId={provision.marketId}
            side={Side.SIDE_BUY}
            key={`SIDE_BUY-${i}`}
            normaliseProportionsTo={buyTotal}
          />
        ))}
        <LiquidityProvisionMid />
        {provision.sells?.map((s, i) => (
          <LiquidityProvisionDetailsRow
            order={s}
            marketId={provision.marketId}
            side={Side.SIDE_SELL}
            key={`SIDE_SELL-${i}`}
            normaliseProportionsTo={sellTotal}
          />
        ))}
      </tbody>
    </table>
  );
}
