import {
  addDecimalsFormatNumber,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import type { CandleClose } from '@vegaprotocol/types';
import { PriceCellChange, Sparkline } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';
import { mapDataToMarketList } from '../../utils';
import type { MarketList } from '../markets-container/__generated__/MarketList';

export interface SelectMarketListDataProps {
  data: MarketList | undefined;
  onSelect: (id: string) => void;
}

export const SelectMarketList = ({
  data,
  onSelect,
}: SelectMarketListDataProps) => {
  const thClassNames = (direction: 'left' | 'right') =>
    `px-8 text-${direction} font-sans font-normal text-ui-small leading-9 mb-0 text-dark/80 dark:text-white/80`;
  const tdClassNames =
    'px-8 font-sans leading-9 capitalize text-ui-small text-right';

  const boldUnderlineClassNames =
    'px-8 underline font-sans text-base leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80';
  return (
    <div
      className="max-h-[40rem] overflow-x-auto"
      data-testid="select-market-list"
    >
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
              .slice(0, 12)
              ?.map(({ id, marketName, lastPrice, candles, decimalPlaces }) => {
                const candlesClose: string[] = candles
                  .map((candle) => candle?.close)
                  .filter((c): c is CandleClose => c !== null);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-black/20 dark:hover:bg-white/20 cursor-pointer relative`}
                  >
                    <td className={`${boldUnderlineClassNames} relative`}>
                      <Link href={`/markets/${id}`} passHref={true}>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a
                          onClick={() => onSelect(id)}
                          data-testid={`market-link-${id}`}
                        >
                          {marketName}
                        </a>
                      </Link>
                    </td>
                    <td className={tdClassNames}>
                      {lastPrice && (
                        <PriceCell
                          value={BigInt(lastPrice)}
                          valueFormatted={addDecimalsFormatNumber(
                            lastPrice.toString(),
                            decimalPlaces,
                            2
                          )}
                        />
                      )}
                    </td>
                    <td className={`${tdClassNames} `}>
                      <PriceCellChange
                        candles={candlesClose}
                        decimalPlaces={decimalPlaces}
                      />
                    </td>
                    <td className="px-8">
                      {candles && (
                        <Sparkline
                          width={100}
                          height={20}
                          muted={false}
                          data={candlesClose.map((c) => Number(c))}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>

      <a className={`${boldUnderlineClassNames} text-ui-small`} href="/markets">
        {t('Or view full market list')}
      </a>
    </div>
  );
};
