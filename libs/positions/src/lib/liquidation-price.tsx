import { useEstimatePositionQuery } from './__generated__/Positions';
import { formatRange } from '@vegaprotocol/utils';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimalPlaces,
  formatDecimals,
  marginBalance,
  quantum,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimalPlaces: number;
  formatDecimals: number;
  marginBalance: string;
  quantum: string;
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
  let value = '-';

  if (data) {
    const bestCase =
      data.estimatePosition?.liquidation?.bestCase.open_volume_only.replace(
        /\..*/,
        ''
      );
    const worstCase =
      data.estimatePosition?.liquidation?.worstCase.open_volume_only.replace(
        /\..*/,
        ''
      );
    value =
      bestCase && worstCase && BigInt(bestCase) < BigInt(worstCase)
        ? formatRange(
            bestCase,
            worstCase,
            decimalPlaces,
            undefined,
            formatDecimals,
            value
          )
        : formatRange(
            worstCase,
            bestCase,
            decimalPlaces,
            undefined,
            formatDecimals,
            value
          );
  }

  return <span data-testid="liquidation-price">{value}</span>;
};
