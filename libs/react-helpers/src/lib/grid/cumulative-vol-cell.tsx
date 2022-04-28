import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

import { BID_COLOR, ASK_COLOR } from './vol-cell';

export interface CumulativeVolProps {
  ask?: number;
  bid?: number;
  relativeAsk?: number;
  relativeBid?: number;
}

export interface ICumulativeVolCellProps extends ICellRendererParams {
  value: CumulativeVolProps;
}

export const CumulativeVol = React.memo(
  ({ relativeAsk, relativeBid, ask, bid }: CumulativeVolProps) => {
    const askBar = relativeAsk ? (
      <div
        className="absolute left-0 top-0"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          width: `${relativeAsk}%`,
          backgroundColor: ASK_COLOR,
        }}
      ></div>
    ) : null;
    const bidBar = relativeBid ? (
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
        {askBar}
        {bidBar}
        <span className="relative">
          {ask ? ask : null}
          {ask && bid ? '/' : null}
          {bid ? bid : null}
        </span>
      </div>
    );
  }
);

CumulativeVol.displayName = 'CumulativeVol';

export const CumulativeVolCell = ({ value }: ICumulativeVolCellProps) => (
  <CumulativeVol {...value} />
);

CumulativeVolCell.displayName = 'CumulativeVolCell';
