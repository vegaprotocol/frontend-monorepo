import groupBy from 'lodash/groupBy';
import { type Estimate } from '@0xsquid/squid-types';
import { toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const SwapInfo = (props: { estimate: Estimate }) => {
  const feeGroups = groupBy(props.estimate.feeCosts, 'token.address');
  const gasGroups = groupBy(props.estimate.gasCosts, 'token.address');

  return (
    <>
      <dl className="grid grid-cols-2">
        {Object.values(gasGroups).map((group) => {
          const fees = group.map((f) => {
            return toBigNum(f.amount, f.token.decimals);
          });
          const total = BigNumber.sum.apply(null, fees);
          return (
            <>
              <dt>Gas costs</dt>
              <dd className="text-right">
                {total.toString()} {group[0].token.symbol}
              </dd>
            </>
          );
        })}
      </dl>

      <dl className="grid grid-cols-2">
        {Object.values(feeGroups).map((group) => {
          const fees = group.map((f) => {
            return toBigNum(f.amount, f.token.decimals);
          });
          const total = BigNumber.sum.apply(null, fees);
          return (
            <>
              <dt>Estimated fees</dt>
              <dd className="text-right">
                {total.toString()} {group[0].token.symbol}
              </dd>
            </>
          );
        })}
      </dl>

      <dl className="grid grid-cols-2">
        <dt>Slippage</dt>
        <dd className="text-right">
          {
            // @ts-ignore aggregateSlippage is not in the type definition
            props.estimate.aggregateSlippage
          }
        </dd>
      </dl>
    </>
  );
};
