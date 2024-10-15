import {
  Decimal,
  useLiquidityFees,
  useMakerFees,
  type Market,
} from '@vegaprotocol/rest';
import BigNumber from 'bignumber.js';
import { Currency } from '../currency';

export const TotalFees = ({ market }: { market: Market }) => {
  const { data: liquidityFees } = useLiquidityFees(market.id);
  const { data: makerFees } = useMakerFees(market.id);

  const liqFeesVal = liquidityFees?.totalFeesPaid.value || BigNumber(0);
  const makerFeesVal = makerFees?.totalFeesPaid.value || BigNumber(0);

  const value = liqFeesVal.plus(makerFeesVal);
  const formatDecimals = Decimal.getQuantumDecimals(
    market.settlementAsset.quantum,
    market.settlementAsset.decimals
  );

  return (
    <Currency
      value={value}
      formatDecimals={formatDecimals}
      symbol={market.settlementAsset.symbol}
    />
  );
};
