import { useEstimatePositionQuery } from './__generated__/Positions';
import { formatRange } from '@vegaprotocol/utils';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimals,
  quantum,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimals: number;
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
        ? formatRange(bestCase, worstCase, decimals, quantum, value)
        : formatRange(worstCase, bestCase, decimals, quantum, value);
  }
  return <span data-testid="liquidation-price">{value}</span>;
};
