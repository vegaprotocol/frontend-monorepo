import { useAMMs, type Market } from '@vegaprotocol/rest';
import { v1AMMStatus } from '@vegaprotocol/rest-clients/dist/trading-data';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import { Currency } from '../currency';

export const AMMTotalLiquidity = ({ market }: { market: Market }) => {
  const { data: amms } = useAMMs({ marketId: market.id });

  const activeAmms = compact(
    amms?.filter((a) => a.status === v1AMMStatus.STATUS_ACTIVE)
  );

  const commitments = activeAmms.map((a) => a.commitment.value);

  const total = BigNumber.sum.apply(
    null,
    commitments.length > 0 ? commitments : [0]
  );

  return <Currency value={total} asset={market.quoteAsset} />;
};
