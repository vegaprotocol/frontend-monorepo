import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

const INTERSECT_COLOR = 'darkgray';

export interface ICummulativeVolCellProps extends ICellRendererParams {
  value: {
    bid?: number;
    ask?: number;
  };
}

export const CummulativeVolCell = ({ value }: ICummulativeVolCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="cummulative-vol">-</span>;
  }
  const bid = value.bid ? (
    <div
      className="h-full absolute top-0 right-0"
      style={{
        width: `${value.bid * 100}%`,
        backgroundColor:
          value.ask && value.ask > value.bid ? INTERSECT_COLOR : BID_COLOR,
      }}
    ></div>
  ) : null;
  const ask = value.ask ? (
    <div
      className="h-full absolute top-0 left-0"
      style={{
        width: `${value.ask * 100}%`,
        backgroundColor:
          value.bid && value.bid > value.ask ? INTERSECT_COLOR : ASK_COLOR,
      }}
    ></div>
  ) : null;
  return (
    <div className="relative" data-testid="vol">
      {value.bid && value.ask && value.bid > value.ask
        ? `${ask}${bid}`
        : `${bid}${ask}`}
    </div>
  );
};

CummulativeVolCell.displayName = 'CummulativeVolCell';
