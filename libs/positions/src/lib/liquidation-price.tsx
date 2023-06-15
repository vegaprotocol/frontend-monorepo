import { useEstimatePositionQuery } from './__generated__/Positions';

import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimals,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimals: number;
}) => {
  const { data } = useEstimatePositionQuery({
    variables: {
      marketId,
      openVolume,
      collateralAvailable,
    },
    fetchPolicy: 'no-cache',
    skip: !openVolume || openVolume === '0',
  });
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
    const formattedBestCase =
      bestCase && addDecimalsFormatNumber(bestCase, decimals);
    const formattedWorstCase =
      worstCase && addDecimalsFormatNumber(worstCase, decimals);
    if (
      formattedBestCase &&
      formattedWorstCase &&
      formattedBestCase !== formattedWorstCase
    ) {
      if (BigInt(bestCase) < BigInt(worstCase)) {
        value = `${formattedBestCase} - ${formattedWorstCase}`;
      } else {
        value = `${formattedWorstCase} - ${formattedBestCase}`;
      }
    } else if (formattedBestCase) {
      value = formattedBestCase;
    }
  }
  return <span>{value}</span>;
};
