import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useEstimatePositionQuery } from './__generated__/Positions';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimalPlaces,
  formatDecimals,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimalPlaces: number;
  formatDecimals: number;
}) => {
  // NOTE!
  //
  // The estimate order query API gives us the liquidation price unformatted but expecting to be converted
  // using asset decimal placse.
  //
  // We need to convert it with asset decimals, but display it formatted with market decimals precision until the API changes.
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

  let bestCase = '-';
  let worstCase = '-';

  bestCase =
    data.estimatePosition?.liquidation?.bestCase.open_volume_only.replace(
      /\..*/,
      ''
    );
  worstCase =
    data.estimatePosition?.liquidation?.worstCase.open_volume_only.replace(
      /\..*/,
      ''
    );
  worstCase = addDecimalsFormatNumber(worstCase, decimalPlaces, formatDecimals);
  bestCase = addDecimalsFormatNumber(bestCase, decimalPlaces, formatDecimals);

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
