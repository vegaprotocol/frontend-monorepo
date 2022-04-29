import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

const INTERSECT_COLOR = 'darkgray';

export interface CumulativeVolProps {
  relativeAsk?: number;
  relativeBid?: number;
}

export interface ICumulativeVolCellProps extends ICellRendererParams {
  value: CumulativeVolProps;
}

export const CumulativeVol = React.memo(
  ({ relativeAsk, relativeBid }: CumulativeVolProps) => {
    const bid = relativeBid ? (
      <div
        className="h-full absolute top-0 right-0"
        style={{
          width: `${relativeBid}%`,
          backgroundColor:
            relativeAsk && relativeAsk > relativeBid
              ? INTERSECT_COLOR
              : BID_COLOR,
        }}
      ></div>
    ) : null;
    const ask = relativeAsk ? (
      <div
        className="h-full absolute top-0 left-0"
        style={{
          width: `${relativeAsk}%`,
          backgroundColor:
            relativeBid && relativeBid > relativeAsk
              ? INTERSECT_COLOR
              : ASK_COLOR,
        }}
      ></div>
    ) : null;
    return (
      <div className="h-full relative" data-testid="vol">
        {relativeBid && relativeAsk && relativeBid > relativeAsk ? (
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
  }
);

CumulativeVol.displayName = 'CumulativeVol';

export const CumulativeVolCell = ({ value }: ICumulativeVolCellProps) => (
  <CumulativeVol {...value} />
);

CumulativeVolCell.displayName = 'CumulativeVolCell';
