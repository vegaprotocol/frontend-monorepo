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

  const label = t('Collateral required ({{symbol}})', {
    symbol: ticket.quoteAsset.symbol,
  });

  const bestCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const worstCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.worstCase ?? '0'
  );

  if (bestCase === BigInt(0) && worstCase === BigInt(0)) {
    return <DatagridRow label={label} value="-" />;
  }

  return (
    <DatagridRow
      label={label}
      value={
        <Tooltip
          description={formatRange(
            bestCase.toString(),
            worstCase.toString(),
            ticket.quoteAsset.decimals
          )}
        >
          <span>
            {formatValue(
              bestCase.toString(),
              ticket.quoteAsset.decimals,
              ticket.quoteAsset.quantum
            )}
          </span>
        </Tooltip>
      }
    />
  );
};
