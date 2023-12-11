import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useEstimatePositionQuery } from './__generated__/Positions';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../use-t';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  collateralAvailable,
  decimalPlaces,
  className,
}: {
  marketId: string;
  openVolume: string;
  collateralAvailable: string;
  decimalPlaces: number;
  className?: string;
}) => {
  const t = useT();
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
      align="end"
      description={
        <dl className="grid grid-cols-2">
          <dt>{t('Worst case')}</dt>
          <dd className="pl-2 text-right font-mono">{worstCase}</dd>
          <dt className="font-normal">{t('Best case')}</dt>
          <dd className="pl-2 text-right font-mono">{bestCase}</dd>
        </dl>
      }
    >
      <span data-testid="liquidation-price" className={className}>
        {worstCase}
      </span>
    </Tooltip>
  );
};
