import { t } from '@vegaprotocol/react-helpers';
import type { components } from '../../../../../types/explorer';
import type { LiquiditySubmission } from '../tx-liquidity-submission';

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
  side: VegaSide;
};

export function LiquidityProvisionDetailsRow({
  order,
  side,
}: LiquidityProvisionDetailsRowProps) {
  if (!order) {
    return null;
  }

  const label = side === 'SIDE_BUY' ? '+' : '-';

  return (
    <tr>
      <td>
        {label} {order.offset ? order.offset : '-'}
      </td>
      <td>
        {order.reference ? LiquidityReferenceLabel[order.reference] : '-'}
      </td>
      <td>{order.proportion ? `${order.proportion}%` : '-'}</td>
    </tr>
  );
}

export type LiquidityProvisionDetailsProps = {
  provision: LiquiditySubmission;
};

export function LiquidityProvisionDetails({
  provision,
}: LiquidityProvisionDetailsProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>{t('Price offset')}</th>
          <th>{t('Price reference')}</th>
          <th>{t('Proportion')}</th>
        </tr>
      </thead>
      <tbody>
        {provision.buys?.map((b, i) => (
          <LiquidityProvisionDetailsRow
            order={b}
            side={'SIDE_BUY'}
            key={`SIDE_BUY-${i}`}
          />
        ))}
        <LiquidityPrivisionMid />
        {provision.sells?.map((s, i) => (
          <LiquidityProvisionDetailsRow
            order={s}
            side={'SIDE_SELL'}
            key={`SIDE_SELL-${i}`}
          />
        ))}
      </tbody>
    </table>
  );
}

export function LiquidityPrivisionMid() {
  return (
    <tr>
      <td colSpan={3} className="text-center">
        ---
      </td>
    </tr>
  );
}
