import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

export interface CumulativeVolProps {
  relativeAsk?: number;
  relativeBid?: number;
}

export interface ICumulativeVolCellProps extends ICellRendererParams {
  value: CumulativeVolProps;
}

export const CumulativeVol = React.memo(
  ({ relativeAsk, relativeBid }: CumulativeVolProps) => {
    const ask = relativeAsk ? (
      <div
        className="absolute left-0 top-0"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          width: `${relativeAsk}%`,
          backgroundColor: ASK_COLOR,
        }}
      ></div>
    ) : null;
    const bid = relativeBid ? (
      <div
        className="absolute top-0 left-0"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          top: relativeBid && relativeAsk ? '50%' : '0',
          width: `${relativeBid}%`,
          backgroundColor: BID_COLOR,
        }}
      ></div>
    ) : null;

    return (
      <div className="h-full relative" data-testid="vol">
        {ask}
        {bid}
      </div>
    );
  }
);

CumulativeVol.displayName = 'CumulativeVol';

export const CumulativeVolCell = ({ value }: ICumulativeVolCellProps) => (
  <CumulativeVol {...value} />
);

CumulativeVolCell.displayName = 'CumulativeVolCell';
