import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

const INTERSECT_COLOR = 'darkgray';

export interface CummulativeVolProps {
  relativeAsk?: string;
  relativeBid?: string;
}

export interface ICummulativeVolCellProps extends ICellRendererParams {
  value: CummulativeVolProps;
}

export const CummulativeVol = React.memo(
  ({ relativeAsk, relativeBid }: CummulativeVolProps) => {
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

CummulativeVol.displayName = 'CummulativeVol';

export const CummulativeVolCell = ({ value }: ICummulativeVolCellProps) => (
  <CummulativeVol {...value} />
);

CummulativeVolCell.displayName = 'CummulativeVolCell';
