import {
  useLiquidityFees,
  useMakerFees,
  type Market,
} from '@vegaprotocol/rest';
import BigNumber from 'bignumber.js';
import { Currency } from '../currency';

export const TotalFees = ({ market }: { market: Market }) => {
  const { data: liquidityFees } = useLiquidityFees(market.id);
  const { data: makerFees } = useMakerFees(market.id);

  const lf = liquidityFees?.totalFeesPaid.value || BigNumber(0);
  const mf = makerFees?.totalFeesPaid.value || BigNumber(0);

  return <Currency value={lf.plus(mf)} asset={market.quoteAsset} />;
};
