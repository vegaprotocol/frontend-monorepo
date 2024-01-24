import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useEstimatePositionQuery } from './__generated__/Positions';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../use-t';
import { MarginMode } from '@vegaprotocol/types';

export const LiquidationPrice = ({
  marketId,
  openVolume,
  averageEntryPrice,
  generalAccountBalance,
  marginAccountBalance,
  orderMarginAccountBalance,
  marginMode = MarginMode.MARGIN_MODE_CROSS_MARGIN,
  marginFactor,
  decimalPlaces,
  className,
}: {
  marketId: string;
  openVolume: string;
  averageEntryPrice: string;
  generalAccountBalance: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
  marginMode: MarginMode;
  marginFactor: string;
  decimalPlaces: number;
  className?: string;
}) => {
  const t = useT();
  const { data: currentData, previousData } = useEstimatePositionQuery({
    variables: {
      marketId,
      openVolume,
      averageEntryPrice,
      generalAccountBalance,
      marginAccountBalance,
      orderMarginAccountBalance,
      marginMode,
      marginFactor,
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
