import * as React from 'react';

/*
import { useMarketOverview } from '../../../../hooks/use-market-overview'
import { colorByMarketMovement } from '../../../../lib/vega-colours'
import { Sparkline } from '../../components/sparkline'
import { VEGA_TABLE_CLASSES } from '../../components/vega-table'
*/

export interface SummaryCellProps {
  value: string; // marketId
}

export const SummaryCellView = ({ value }: SummaryCellProps) => {
  // const { sparkline, change, bullish } = useMarketOverview(value)
  // const color = colorByMarketMovement(bullish)

  return (
    <>
      {/* <Sparkline data={sparkline} style={{ marginRight: 4 }} />*/}
      <span>{'change'}</span>
    </>
  );
};

SummaryCellView.displayName = 'SummaryCellView';

export const SummaryCell = React.memo(SummaryCellView);
SummaryCell.displayName = 'SummaryCell';
