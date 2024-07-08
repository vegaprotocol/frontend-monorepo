import { formatRange, formatValue } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useEstimatePosition } from '../use-estimate-position';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';

export const emptyValue = '-';

export const CollateralRequired = () => {
  const t = useT();
  const ticket = useTicketContext();

  const { data } = useEstimatePosition();

  const collateralIncreaseEstimateBestCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const collateralIncreaseEstimateWorstCase = BigInt(
    data?.estimatePosition?.collateralIncreaseEstimate.worstCase ?? '0'
  );

  return (
    <DatagridRow
      label={t('Collateral required')}
      value={
        <Tooltip
          description={formatRange(
            collateralIncreaseEstimateBestCase.toString(),
            collateralIncreaseEstimateWorstCase.toString(),
            ticket.settlementAsset.decimals
          )}
        >
          <span>
            {formatValue(
              collateralIncreaseEstimateBestCase.toString(),
              ticket.settlementAsset.decimals,
              ticket.settlementAsset.quantum
            )}
          </span>
        </Tooltip>
      }
    />
  );
};
