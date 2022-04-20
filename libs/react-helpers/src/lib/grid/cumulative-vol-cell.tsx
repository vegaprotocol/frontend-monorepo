import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

const INTERSECT_COLOR = 'darkgray';

export interface CumulativeVolProps {
  relativeAsk?: string;
  relativeBid?: string;
}

export interface ICumulativeVolCellProps extends ICellRendererParams {
  value: CumulativeVolProps;
}

export const CumulativeVol = React.memo(
  ({ relativeAsk, relativeBid }: CumulativeVolProps) => {
    const relativeAskNumber = relativeAsk ? parseInt(relativeAsk) : 0;
    const relativeBidNumber = relativeBid ? parseInt(relativeBid) : 0;
    const bid = relativeBidNumber ? (
      <div
        className="h-full absolute top-0 right-0"
        style={{
          width: relativeBid,
          backgroundColor:
            relativeAsk && relativeAskNumber > relativeBidNumber
              ? INTERSECT_COLOR
              : BID_COLOR,
        }}
      ></div>
    ) : null;
    const ask = relativeAsk ? (
      <div
        className="h-full absolute top-0 left-0"
        style={{
          width: relativeAsk,
          backgroundColor:
            relativeBid && relativeBidNumber > relativeAskNumber
              ? INTERSECT_COLOR
              : ASK_COLOR,
        }}
      ></div>
    ) : null;
    return (
      <div className="h-full relative" data-testid="vol">
        {relativeBidNumber &&
        relativeAskNumber &&
        relativeBidNumber > relativeAskNumber ? (
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
