import { useLiquidityProvisions, type Market } from '@vegaprotocol/rest';
import { vegaLiquidityProvisionStatus } from '@vegaprotocol/rest-clients/dist/trading-data';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import { LoaderCircleIcon } from 'lucide-react';
import { formatNumberRounded } from '@vegaprotocol/utils';

export const LPTotalLiquidity = ({ market }: { market: Market }) => {
  const { data: provisions, status } = useLiquidityProvisions(market.id);

  if (status === 'pending') {
    return (
      <div className="h-4 py-1">
        <LoaderCircleIcon size={16} className="animate-spin" />
      </div>
    );
  }

  const activeProvisions = compact(
    provisions?.filter(
      (p) => p.status === vegaLiquidityProvisionStatus.STATUS_ACTIVE
    )
  );

  const commitments = activeProvisions.map((p) => p.commitmentAmount.value);

  const total = BigNumber.sum.apply(
    null,
    commitments.length > 0 ? commitments : [0]
  );

  return (
    <span>
      {formatNumberRounded(total)} {market.quoteSymbol}
    </span>
  );
};
