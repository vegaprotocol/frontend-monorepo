import { formatRange, formatValue } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useEstimatePosition } from '../use-estimate-position';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';

export const CollateralRequired = () => {
  const t = useT();
  const ticket = useTicketContext();

  const { data } = useEstimatePosition();

  const asset =
    ticket.type === 'default' ? ticket.settlementAsset : ticket.quoteAsset;

  const label = t('Collateral required ({{symbol}})', {
    symbol: asset.symbol,
  });

  const bestCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const worstCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.worstCase ?? '0'
  );

  const props = {
    label,
    'data-testid': 'collateral-required',
  };

  if (bestCase === BigInt(0) && worstCase === BigInt(0)) {
    return <DatagridRow {...props} value="-" />;
  }

  return (
    <DatagridRow
      {...props}
      value={
        <Tooltip
          description={formatRange(
            bestCase.toString(),
            worstCase.toString(),
            asset.decimals
          )}
        >
          <span>
            {formatValue(bestCase.toString(), asset.decimals, asset.quantum)}
          </span>
        </Tooltip>
      }
    />
  );
};
