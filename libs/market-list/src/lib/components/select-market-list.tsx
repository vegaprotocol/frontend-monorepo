import {
  addDecimalsFormatNumber,
  formatLabel,
  formatNumberPercentage,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import type { CandleClose } from '@vegaprotocol/types';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';
import { PriceCellChange, Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';
import { mapDataToMarketList } from '../utils';
import type {
  MarketList,
  MarketList_markets_fees_factors,
} from '../__generated__/MarketList';
import { useQuery } from '@apollo/client';
import { Interval } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MARKET_LIST_QUERY } from '../markets-data-provider';
import isNil from 'lodash/isNil';
import BigNumber from 'bignumber.js';

const thClassNames = (direction: 'left' | 'right') =>
  `px-8 text-${direction} font-sans font-normal text-ui-small leading-9 mb-0 text-dark/80 dark:text-white/80`;
const tdClassNames =
  'px-8 font-sans leading-9 capitalize text-ui-small text-right';

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
            marketList?.map((market) => {
              const candlesClose: string[] = market.candles
                .map((candle) => candle?.close)
                .filter((c): c is CandleClose => c !== null);
              return (
                <tr
                  key={market.id}
                  className={`hover:bg-black/20 dark:hover:bg-white/20 cursor-pointer relative`}
                >
                  <td className={`${boldUnderlineClassNames} relative`}>
                    <Link href={`/markets/${market.id}`} passHref={true}>
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid,jsx-a11y/no-static-element-interactions */}
                      <a
                        onKeyPress={(event) => handleKeyPress(event, market.id)}
                        onClick={() => onSelect(market.id)}
                        data-testid={`market-link-${market.id}`}
                        className={`focus:decoration-vega-pink dark:focus:decoration-vega-yellow`}
                      >
                        {market.tradableInstrument.instrument.code}
                      </a>
                    </Link>
                  </td>
                  <td className={tdClassNames}>
                    {market.lastPrice ? (
                      <PriceCell
                        value={BigInt(market.lastPrice)}
                        valueFormatted={addDecimalsFormatNumber(
                          market.lastPrice.toString(),
                          market.decimalPlaces,
                          2
                        )}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  {detailed && (
                    <td className={`${thClassNames('left')} `}>
                      {market.settlementAsset}
                    </td>
                  )}
                  <td className={`${tdClassNames} `}>
                    <PriceCellChange
                      candles={candlesClose}
                      decimalPlaces={market.decimalPlaces}
                    />
                  </td>
                  <td className="px-8">
                    {market.candles && (
                      <Sparkline
                        width={100}
                        height={20}
                        muted={false}
                        data={candlesClose.map((c) => Number(c))}
                      />
                    )}
                  </td>
                  {detailed && (
                    <>
                      <td className={`${tdClassNames} `}>
                        {market.candleHigh ? (
                          <PriceCell
                            value={BigInt(market.candleHigh)}
                            valueFormatted={addDecimalsFormatNumber(
                              market.candleHigh.toString(),
                              market.decimalPlaces,
                              2
                            )}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={`${tdClassNames} `}>
                        {market.candleLow ? (
                          <PriceCell
                            value={BigInt(market.candleLow)}
                            valueFormatted={addDecimalsFormatNumber(
                              market.candleLow.toString(),
                              market.decimalPlaces,
                              2
                            )}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={`${thClassNames('left')} `}>
                        {market.tradingMode ===
                          MarketTradingMode.MonitoringAuction &&
                        market.data?.trigger &&
                        market.data.trigger !== AuctionTrigger.Unspecified
                          ? `${formatLabel(
                              market.tradingMode
                            )} - ${market.data?.trigger.toLowerCase()}`
                          : formatLabel(market.tradingMode)}
                      </td>
                      <Tooltip
                        description={
                          <FeesBreakdown feeFactors={market.fees.factors} />
                        }
                      >
                        <td className={`${tdClassNames} border-dotted`}>
                          {market.totalFees || '-'}
                        </td>
                      </Tooltip>
                      <td className={`${tdClassNames} `}>
                        {market.data && market.data.indicativeVolume !== '0'
                          ? addDecimalsFormatNumber(
                              market.data.indicativeVolume,
                              market.positionDecimalPlaces
                            )
                          : '-'}
                      </td>
                      <td className={`${thClassNames('left')} `}>
                        {market.name}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export const FeesBreakdown = ({
  feeFactors,
}: {
  feeFactors: MarketList_markets_fees_factors;
}) => {
  return (
    <table>
      <thead>
        <th></th>
        <th></th>
      </thead>
      <tbody>
        <tr>
          <td className={thClassNames('left')}>{t('Infrastructure Fee')}</td>
          <td className={tdClassNames}>
            {formatNumberPercentage(
              new BigNumber(feeFactors.infrastructureFee).times(100)
            )}
          </td>
        </tr>
        <tr>
          <td className={thClassNames('left')}>{t('Liquidity Fee')}</td>
          <td className={tdClassNames}>
            {formatNumberPercentage(
              new BigNumber(feeFactors.liquidityFee).times(100)
            )}
          </td>
        </tr>
        <tr>
          <td className={thClassNames('left')}>{t('Maker Fee')}</td>
          <td className={tdClassNames}>
            {formatNumberPercentage(
              new BigNumber(feeFactors.makerFee).times(100)
            )}
          </td>
        </tr>
        <tr>
          <td className={thClassNames('left')}>{t('Total Fees')}</td>
          <td className={tdClassNames}>
            {formatNumberPercentage(
              new BigNumber(feeFactors.makerFee).times(100)
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
