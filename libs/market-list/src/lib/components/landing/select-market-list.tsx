import { Arrow, Sparkline } from '@vegaprotocol/ui-toolkit';
import type { BigNumber } from 'bignumber.js';
import { mapDataToMarketList } from '../../utils';
import type { MarketList } from '../__generated__/MarketList';

export interface MarketSparklineProps {
  candles?: {
    close: string | undefined | number | BigNumber;
    open: string | undefined | number | BigNumber;
  }[];
}

export const MarketSparkline = ({ candles }: MarketSparklineProps) => {
  return (
    <Sparkline
      width={100}
      height={20}
      muted={false}
      data={
        candles
          ?.filter(({ close }) => !isNaN(Number(close)))
          ?.map(({ close }) => Number(close)) || []
      }
    />
  );
};

export interface SelectMarketListProps {
  data: MarketList | undefined;
}

export const SelectMarketList = ({ data }: SelectMarketListProps) => {
  const thClassNames = (direction: 'left' | 'right') =>
    `px-8 text-${direction} font-sans font-normal text-ui-small leading-9 mb-0 text-dark/80 dark:text-white/80`;
  const tdClassNames =
    'px-8 font-sans leading-9 capitalize text-ui-small text-right';
  const priceChangeClassNames = (value: number) =>
    value === 0
      ? 'text-black dark:text-white'
      : value > 0
      ? `text-green-dark dark:text-green-vega `
      : `text-red-dark dark:text-red-vega`;
  const boldUnderlineClassNames =
    'px-8 underline font-sans text-base leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80';
  const stretchedLink = `after:content-[''] after:inset-0 after:z-[1] after:absolute after:box-border`;

  return (
    <div className="max-h-[40rem] overflow-x-auto">
      <table className="relative h-full min-w-full whitespace-nowrap">
        <thead className="sticky top-0 z-10 dark:bg-black bg-white">
          <tr>
            <th className={thClassNames('left')}>Market</th>
            <th className={thClassNames('right')}>Last price</th>
            <th className={thClassNames('right')}>Change (24h)</th>
            <th className={thClassNames('right')}></th>
          </tr>
        </thead>
        <tbody>
          {data &&
            mapDataToMarketList(data)
              ?.filter(
                ({ candles, lastPrice }) =>
                  (candles && lastPrice) || lastPrice !== 'N/A'
              )
              .slice(0, 12)
              ?.map(
                ({
                  id,
                  marketName,
                  change,
                  lastPrice,
                  candles,
                  changePercentage,
                }) => (
                  <tr
                    key={id}
                    className={`hover:bg-black/20 dark:hover:bg-white/20 cursor-pointer relative`}
                  >
                    <td className={`${boldUnderlineClassNames} relative`}>
                      <a
                        href={`/markets/${id}?portfolio=orders&trade=orderbook&chart=candles`}
                        className={stretchedLink}
                      >
                        {marketName}
                      </a>
                    </td>
                    <td className={tdClassNames}>
                      {lastPrice !== 'N/A'
                        ? lastPrice?.toNumber().toLocaleString()
                        : 'N/A'}
                    </td>
                    <td
                      className={`${tdClassNames} ${priceChangeClassNames(
                        change
                      )} flex items-center gap-4 justify-end`}
                    >
                      {<Arrow value={change} />}
                      <span className="flex items-center gap-6">
                        <span>
                          {changePercentage.toFixed(2).toLocaleString()}%&nbsp;
                        </span>
                        <span>({change.toLocaleString()})</span>
                      </span>
                    </td>
                    <td className="px-8">
                      {<MarketSparkline candles={candles} />}
                    </td>
                  </tr>
                )
              )}
        </tbody>
      </table>

      <a className={`${boldUnderlineClassNames} text-ui-small`} href="/markets">
        {'Or view full market list'}
      </a>
    </div>
  );
};
