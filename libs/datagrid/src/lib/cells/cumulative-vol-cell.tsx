import { memo } from 'react';
import { BID_COLOR, ASK_COLOR } from './vol-cell';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { NumericCell } from './numeric-cell';

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

export const CumulativeVol = memo(
  ({
    relativeAsk,
    relativeBid,
    ask,
    bid,
    indicativeVolume,
    testId,
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
      />
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
      />
    ) : null;

    const volume = indicativeVolume ? (
      <span>
        (
        <NumericCell
          value={Number(indicativeVolume)}
          valueFormatted={addDecimalsFormatNumber(
            indicativeVolume,
            positionDecimalPlaces ?? 0
          )}
        />
        )
      </span>
    ) : (
      <span>
        {ask ? (
          <NumericCell
            value={ask}
            valueFormatted={addDecimalsFormatNumber(
              ask,
              positionDecimalPlaces ?? 0
            )}
          />
        ) : null}
        {ask && bid ? '/' : null}
        {bid ? (
          <NumericCell
            value={ask}
            valueFormatted={addDecimalsFormatNumber(
              bid,
              positionDecimalPlaces ?? 0
            )}
          />
        ) : null}
      </span>
    );

    return (
      <div
        className="relative font-mono pr-1"
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
