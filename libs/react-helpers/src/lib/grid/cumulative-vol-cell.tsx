import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { BID_COLOR, ASK_COLOR } from './vol-cell';

export interface CumulativeVolProps {
  ask?: number;
  bid?: number;
  relativeAsk?: number;
  relativeBid?: number;
  indicativeVolume?: string;
  testId?: string;
  className?: string;
}

export interface ICumulativeVolCellProps extends ICellRendererParams {
  value: CumulativeVolProps;
}

export const CumulativeVol = React.memo(
  ({
    relativeAsk,
    relativeBid,
    ask,
    bid,
    indicativeVolume,
    testId,
    className,
  }: CumulativeVolProps) => {
    const askBar = relativeAsk ? (
      <div
        data-testid="ask-bar"
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
        data-testid="bid-bar"
        className="absolute top-0 left-0"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          top: relativeBid && relativeAsk ? '50%' : '0',
          width: `${relativeBid}%`,
          backgroundColor: BID_COLOR,
        }}
      ></div>
    ) : null;

    const volume = indicativeVolume ? (
      <span className="relative">({indicativeVolume})</span>
    ) : (
      <span className="relative">
        {ask ? ask : null}
        {ask && bid ? '/' : null}
        {bid ? bid : null}
      </span>
    );

    return (
      <div
        className={classNames('h-full relative', className)}
        data-testid={testId || 'cummulative-vol'}
      >
        {askBar}
        {bidBar}
        {volume}
      </div>
    );
  }
);

CumulativeVol.displayName = 'CumulativeVol';

export const CumulativeVolCell = ({ value }: ICumulativeVolCellProps) => (
  <CumulativeVol {...value} />
);

CumulativeVolCell.displayName = 'CumulativeVolCell';
