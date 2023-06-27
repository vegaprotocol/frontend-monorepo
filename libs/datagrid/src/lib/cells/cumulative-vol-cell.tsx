import { memo } from 'react';
import { addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell } from './numeric-cell';
import { theme } from '@vegaprotocol/tailwindcss-config';

const BID_COLOR = theme.colors.vega.green.DEFAULT;
const ASK_COLOR = theme.colors.vega.pink.DEFAULT;
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
          valueFormatted={addDecimalsFixedFormatNumber(
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
            valueFormatted={addDecimalsFixedFormatNumber(
              ask,
              positionDecimalPlaces ?? 0
            )}
          />
        ) : null}
        {ask && bid ? '/' : null}
        {bid ? (
          <NumericCell
            value={ask}
            valueFormatted={addDecimalsFixedFormatNumber(
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
