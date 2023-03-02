import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../../types/explorer';
import { TableRow } from '../../../../table';
import { LiquidityProvisionOffset } from './liquidity-provision-offset';

export type VegaPeggedReference = components['schemas']['vegaPeggedReference'];
export type VegaSide = components['schemas']['vegaSide'];

export type LiquidityProvisionOrder =
  components['schemas']['vegaLiquidityOrder'];

export const LiquidityReferenceLabel: Record<VegaPeggedReference, string> = {
  PEGGED_REFERENCE_BEST_ASK: t('Best Ask'),
  PEGGED_REFERENCE_BEST_BID: t('Best Bid'),
  PEGGED_REFERENCE_MID: t('Mid'),
  PEGGED_REFERENCE_UNSPECIFIED: '-',
};

export type LiquidityProvisionDetailsRowProps = {
  order?: LiquidityProvisionOrder;
  marketId?: string;
  side: VegaSide;
  // If this is
  normaliseProportionsTo: number;
};

/**
 *
 * Note: offset is formatted by settlement asset on the market, assuming that is available
 * Note: Due to the mix of references (MID vs BEST_X), it's not possible to correctly order
 *       the orders by their actual distance from a midpoint. This would require us knowing
 *       the best bid (now or at placement) and the mid. Getting the data for *now* would be
 *       misleading for LP submissions in the past. There is no API for getting <mid />
 *       at the time of a transaction.
 */
export function LiquidityProvisionDetailsRow({
  normaliseProportionsTo,
  order,
  side,
  marketId,
}: LiquidityProvisionDetailsRowProps) {
  if (!order || !order.proportion) {
    return null;
  }

  const proportion =
    normaliseProportionsTo === 100
      ? order.proportion
      : Math.round((order.proportion / normaliseProportionsTo) * 100);

  const key = `${side}-${proportion}-${order.offset ? order.offset : ''}`;

  return (
    <TableRow modifier="bordered" key={key} data-testid={key}>
      <td className="text-right px-2">
        {order.offset && marketId ? (
          <LiquidityProvisionOffset
            offset={order.offset}
            side={side}
            marketId={marketId}
          />
        ) : (
          '-'
        )}
      </td>
      <td className="text-center">
        {order.reference ? LiquidityReferenceLabel[order.reference] : '-'}
      </td>
      <td className="text-center">{proportion}%</td>
    </TableRow>
  );
}
