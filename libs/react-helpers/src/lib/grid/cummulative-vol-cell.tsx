import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

const INTERSECT_COLOR = 'darkgray';

export interface ICummulativeVolCellProps extends ICellRendererParams {
  value: {
    relativeAsk?: number;
    relativeBid?: number;
  };
}

export const CummulativeVolCell = ({ value }: ICummulativeVolCellProps) => {
  const bid = value.relativeBid ? (
    <div
      className="h-full absolute top-0 right-0"
      style={{
        width: `${value.relativeBid * 100}%`,
        backgroundColor:
          value.relativeAsk && value.relativeAsk > value.relativeBid
            ? INTERSECT_COLOR
            : BID_COLOR,
      }}
    ></div>
  ) : null;
  const ask = value.relativeAsk ? (
    <div
      className="h-full absolute top-0 left-0"
      style={{
        width: `${value.relativeAsk * 100}%`,
        backgroundColor:
          value.relativeBid && value.relativeBid > value.relativeAsk
            ? INTERSECT_COLOR
            : ASK_COLOR,
      }}
    ></div>
  ) : null;
  return (
    <div className="h-full relative" data-testid="vol">
      {value.relativeBid &&
      value.relativeAsk &&
      value.relativeBid > value.relativeAsk ? (
        <>
          {ask}
          {bid}
        </>
      ) : (
        <>
          {bid}
          {ask}
        </>
      )}
    </div>
  );
};

CummulativeVolCell.displayName = 'CummulativeVolCell';
