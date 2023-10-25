import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useEstimatePositionQuery } from './__generated__/Positions';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimalPlaces,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimalPlaces: number;
}) => {
  const { data: currentData, previousData } = useEstimatePositionQuery({
    variables: {
      marketId,
      openVolume,
      collateralAvailable,
    },
    fetchPolicy: 'no-cache',
    skip: !openVolume || openVolume === '0',
  });

  const data = currentData || previousData;

  if (!data?.estimatePosition?.liquidation) {
    return <span>-</span>;
  }

  let bestCase = data.estimatePosition.liquidation.bestCase.open_volume_only;
  let worstCase = data.estimatePosition.liquidation.worstCase.open_volume_only;

  worstCase = addDecimalsFormatNumber(worstCase, decimalPlaces, decimalPlaces);
  bestCase = addDecimalsFormatNumber(bestCase, decimalPlaces, decimalPlaces);

  return (
    <Tooltip
      description={
        <table>
          <tbody>
            <tr>
              <th>{t('Worst case')}</th>
              <td className="pl-2 font-mono text-right">{worstCase}</td>
            </tr>
            <tr>
              <th>{t('Best case')}</th>
              <td className="pl-2 font-mono text-right">{bestCase}</td>
            </tr>
          </tbody>
        </table>
      }
    >
      <span data-testid="liquidation-price">{worstCase}</span>
    </Tooltip>
  );
};
