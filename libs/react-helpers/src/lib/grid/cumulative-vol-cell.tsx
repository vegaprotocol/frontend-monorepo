import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { BID_COLOR, ASK_COLOR } from './vol-cell';
import { addDecimalsFormatNumber } from '../format';

export interface CumulativeVolProps {
  ask?: number;
  bid?: number;
  relativeAsk?: number;
  relativeBid?: number;
  indicativeVolume?: string;
  testId?: string;
  className?: string;
  positionDecimalPlaces: number;
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
    positionDecimalPlaces,
  }: CumulativeVolProps) => {
    const askBar = relativeAsk ? (
      <div
        data-testid="ask-bar"
        className="absolute left-0 top-0 opacity-40 dark:opacity-100"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          width: `${relativeAsk}%`,
          backgroundColor: ASK_COLOR,
          opacity: 0.6,
        }}
      ></div>
    ) : null;
    const bidBar = relativeBid ? (
      <div
        data-testid="bid-bar"
        className="absolute top-0 left-0 opacity-40 dark:opacity-100"
        style={{
          height: relativeBid && relativeAsk ? '50%' : '100%',
          top: relativeBid && relativeAsk ? '50%' : '0',
          width: `${relativeBid}%`,
          backgroundColor: BID_COLOR,
          opacity: 0.6,
        }}
      ></div>
    ) : null;

    const volume = indicativeVolume ? (
      <span className="relative">
        ({addDecimalsFormatNumber(indicativeVolume, positionDecimalPlaces ?? 0)}
        )
      </span>
    ) : (
      <span className="relative">
        {ask ? addDecimalsFormatNumber(ask, positionDecimalPlaces ?? 0) : null}
        {ask && bid ? '/' : null}
        {bid ? addDecimalsFormatNumber(bid, positionDecimalPlaces ?? 0) : null}
      </span>
    );

    return (
      <div
        className={classNames('h-full relative', className)}
        data-testid={testId || 'cumulative-vol'}
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
