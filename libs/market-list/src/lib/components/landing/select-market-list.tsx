import { Arrow, Sparkline } from '@vegaprotocol/ui-toolkit';
import { useRouter } from 'next/router';
import { mapDataToMarketList } from '../../utils';
import type { MarketList } from '../__generated__/MarketList';

export interface MarketSparklineProps {
  candles?: {
    close: string | undefined | number;
    open: string | undefined | number;
  }[];
}

export const MarketSparkline = ({ candles }: MarketSparklineProps) => {
  return (
    <Sparkline
      width={100}
      height={20}
      data={
        candles
          ?.filter((m) => !isNaN(Number(m.close)))
          ?.map((m) => Number(m.close)) || []
      }
    />
  );
};

export interface SelectMarketListProps {
  data: MarketList | undefined;
}

export const SelectMarketList = ({ data }: SelectMarketListProps) => {
  const thClassNames = (direction: 'left' | 'right') =>
    `px-8 text-${direction} font-sans font-normal text-ui-small leading-9 capitalize mb-0 text-dark/80 dark:text-white/80`;
  const tdClassNames =
    'px-8 font-sans leading-9 capitalize text-ui-small text-right';
  const priceChangeClassNames = (value: number) =>
    value === 0
      ? 'text-black dark:text-white'
      : value > 0
      ? `text-green`
      : `text-red`;
  const boldUnderlineClassNames =
    'px-8 underline font-sans text-base leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80';

  const { pathname, push } = useRouter();

  return (
    <div className="max-h-[40rem] overflow-x-auto">
      <table className="relative h-full min-w-full whitespace-nowrap">
        <thead className="sticky top-0 z-10 dark:bg-black bg-white">
          <tr>
            <th className={thClassNames('left')}>Market</th>
            <th className={thClassNames('right')}>Last Price</th>
            <th className={thClassNames('right')}>Change (24h)</th>
            <th className={thClassNames('right')}></th>
          </tr>
        </thead>
        <tbody>
          {data &&
            mapDataToMarketList(data)
              ?.filter(
                (m) => (m.candles && m.lastPrice) || m.lastPrice !== 'N/A'
              )
              .slice(0, 12)
              ?.map((market) => (
                <tr
                  key={market.id}
                  className="hover:bg-black/20 dark:hover:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    push(
                      `/markets/${market.id}?portfolio=orders&trade=orderbook&chart=candles`
                    );
                  }}
                >
                  <td className={boldUnderlineClassNames}>
                    {market?.marketName}
                  </td>
                  <td className={tdClassNames}>
                    {market?.lastPrice?.toLocaleString()}
                  </td>
                  <td
                    className={`${tdClassNames} ${priceChangeClassNames(
                      market?.change
                    )} flex items-center gap-4 justify-end`}
                  >
                    {<Arrow value={market?.change} />}
                    <span className="flex items-center gap-6">
                      <span>{market?.change.toFixed(2).toLocaleString()}%</span>
                      <span>({market?.change.toLocaleString()})</span>
                    </span>
                  </td>
                  <td className="px-8">
                    {<MarketSparkline candles={market?.candles} />}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      <a
        className={`${boldUnderlineClassNames}`}
        href={pathname}
        onClick={(e) => {
          e.preventDefault();
          push('/markets');
        }}
      >
        {'Or view full market list'}
      </a>
    </div>
  );
};
