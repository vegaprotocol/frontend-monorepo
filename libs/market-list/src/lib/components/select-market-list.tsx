import {
  addDecimalsFormatNumber,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import type { CandleClose } from '@vegaprotocol/types';
import { PriceCellChange, Sparkline } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';
import { mapDataToMarketList } from '../utils';
import type { MarketList } from '../__generated__/MarketList';
import { useQuery } from '@apollo/client';
import { Interval } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MARKET_LIST_QUERY } from '../markets-data-provider';
import isNil from 'lodash/isNil';

export interface SelectMarketListProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  detailed?: boolean;
  size?: 'small' | 'large' | 'tall';
}

export const SelectMarketDialog = ({
  dialogOpen,
  setDialogOpen,
  title = t('Select a market'),
  detailed = false,
  size,
}: SelectMarketListProps) => {
  const setClose = () => setDialogOpen(false);

  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  return (
    <Dialog
      title={title}
      intent={Intent.Primary}
      open={!isNil(data) && dialogOpen}
      onChange={() => setDialogOpen(false)}
      titleClassNames="font-bold font-sans text-3xl tracking-tight mb-0 pl-8"
      size={size}
    >
      <SelectMarketList data={data} onSelect={setClose} detailed={detailed} />
    </Dialog>
  );
};

export interface SelectMarketListDataProps {
  data: MarketList | undefined;
  onSelect: (id: string) => void;
  detailed?: boolean;
}

export const SelectMarketList = ({
  data,
  onSelect,
  detailed = false,
}: SelectMarketListDataProps) => {
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (event.key === 'Enter') {
      return onSelect(id);
    }
  };
  const thClassNames = (direction: 'left' | 'right') =>
    `px-8 text-${direction} font-sans font-normal text-ui-small leading-9 mb-0 text-dark/80 dark:text-white/80`;
  const tdClassNames =
    'px-8 font-sans leading-9 capitalize text-ui-small text-right';

  const boldUnderlineClassNames =
    'px-8 underline font-sans text-base leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80';
  const marketList = data && mapDataToMarketList(data);

  return (
    <div
      className="max-h-[40rem] overflow-x-auto"
      data-testid="select-market-list"
    >
      <table className="relative h-full min-w-full whitespace-nowrap">
        <thead className="sticky top-0 z-10 dark:bg-black bg-white">
          <tr>
            <th className={thClassNames('left')}>{t('Market')}</th>
            <th className={thClassNames('right')}>{t('Last price')}</th>
            {detailed && (
              <th className={thClassNames('left')}>{t('Settlement asset')}</th>
            )}
            <th className={thClassNames('right')}>{t('Change (24h)')}</th>
            <th className={thClassNames('right')}></th>
            {detailed && (
              <>
                <th className={thClassNames('right')}>{t('24h High')}</th>
                <th className={thClassNames('right')}>{t('24h Low')}</th>
                <th className={thClassNames('left')}>{t('Trading mode')}</th>
                <th className={thClassNames('left')}>{t('Taker fee')}</th>
                <th className={thClassNames('left')}>{t('Volume')}</th>
                <th className={thClassNames('left')}>{t('Full name')}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data &&
            marketList?.map(
              ({ id, marketName, lastPrice, candles, decimalPlaces }) => {
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
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid,jsx-a11y/no-static-element-interactions */}
                        <a
                          onKeyPress={(event) => handleKeyPress(event, id)}
                          onClick={() => onSelect(id)}
                          data-testid={`market-link-${id}`}
                          className={`focus:decoration-vega-yellow`}
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
              }
            )}
        </tbody>
      </table>

      <a
        className={`${boldUnderlineClassNames} text-ui-small focus:decoration-vega-yellow`}
        href="/markets"
      >
        {t('Or view full market list')}
      </a>
    </div>
  );
};
