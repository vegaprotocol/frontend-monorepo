import groupBy from 'lodash/groupBy';
import { toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const SwapInfo = (props: {
  route?: RouteResponse['route'];
  error: Error | null;
}) => {
  const t = useT();
  const error = props.error;

  if (error) {
    return <TradingInputError>{error.message}</TradingInputError>;
  }

  if (!props.route) {
    return null;
  }

  const estimate = props.route.estimate;
  const feeGroups = groupBy(estimate.feeCosts, 'token.address');
  const gasGroups = groupBy(estimate.gasCosts, 'token.address');

  return (
    <dl className="text-xs">
      {Object.entries(gasGroups).map(([key, group]) => {
        const fees = group.map((f) => {
          return toBigNum(f.amount, f.token.decimals);
        });
        const total = BigNumber.sum.apply(null, fees);
        return (
          <div key={key} className="grid grid-cols-2">
            <dt className="text-surface-1-fg-muted">{t('Gas costs')}</dt>
            <dd className="text-right">
              {total.toString()} {group[0].token.symbol}
            </dd>
          </div>
        );
      })}
      {Object.entries(feeGroups).map(([key, group]) => {
        const fees = group.map((f) => {
          return toBigNum(f.amount, f.token.decimals);
        });
        const total = BigNumber.sum.apply(null, fees);
        return (
          <div key={key} className="grid grid-cols-2">
            <dt className="text-surface-1-fg-muted">{t('Estimated fees')}</dt>
            <dd className="text-right">
              {total.toString()} {group[0].token.symbol}
            </dd>
          </div>
        );
      })}
      <div className="grid grid-cols-2">
        <dt className="text-surface-1-fg-muted">{t('Slippage')}</dt>
        <dd className="text-right">
          {
            // @ts-ignore aggregateSlippage is not in the type definition
            estimate.aggregateSlippage
          }
        </dd>
      </div>
    </dl>
  );
};
