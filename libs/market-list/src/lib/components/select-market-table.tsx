import {
  addDecimalsFormatNumber,
  formatLabel,
  formatNumberPercentage,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';
import { PriceCellChange, Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import Link from 'next/link';

import { mapDataToMarketList, totalFees } from '../utils';

import type { CandleClose } from '@vegaprotocol/types';
import type {
  MarketList,
  MarketList_markets_fees_factors,
} from '../__generated__/MarketList';

const thClassNames = (direction: 'left' | 'right') =>
  `px-8 text-${direction} font-sans text-ui-small leading-9 mb-0 text-dark dark:text-white first:w-[10%]`;
const tdClassNames =
  'px-8 font-sans leading-9 capitalize text-ui-small text-right text-dark dark:text-white';

export interface Column {
  value: string | React.ReactNode;
  className: string;
  onlyOnDetailed: boolean;
}

export const columnHeaders: Column[] = [
  {
    value: t('Market'),
    className: thClassNames('left'),
    onlyOnDetailed: false,
  },
  {
    value: t('Last price'),
    className: thClassNames('right'),
    onlyOnDetailed: false,
  },
  {
    value: t('Settlement asset'),
    className: thClassNames('left'),
    onlyOnDetailed: true,
  },
  {
    value: t('Change (24h)'),
    className: thClassNames('right'),
    onlyOnDetailed: false,
  },
  { value: t(''), className: thClassNames('right'), onlyOnDetailed: false },
  {
    value: t('24h High'),
    className: thClassNames('right'),
    onlyOnDetailed: true,
  },
  {
    value: t('24h Low'),
    className: thClassNames('right'),
    onlyOnDetailed: true,
  },
  {
    value: t('Trading mode'),
    className: thClassNames('left'),
    onlyOnDetailed: true,
  },
  {
    value: (
      <Tooltip
        description={
          <span className="text-ui-small">
            {t(
              'Fees are paid by market takers on aggressive orders only. The fee displayed is made up of:'
            )}
            <ul>
              <li className="py-5">{t('An infrastructure fee')}</li>
              <li className="py-5">{t('A maker fee')}</li>
              <li className="py-5">{t('A liquidity provision fee')}</li>
            </ul>
          </span>
        }
      >
        <span className="border-b-2 border-dotted">{t('Taker fee')}</span>
      </Tooltip>
    ),
    className: thClassNames('right'),
    onlyOnDetailed: true,
  },
  {
    value: t('Volume'),
    className: thClassNames('right'),
    onlyOnDetailed: true,
  },
  {
    value: t('Full name'),
    className: thClassNames('left'),
    onlyOnDetailed: true,
  },
];

export const SelectMarketTableHeader = ({
  detailed = false,
  headers = columnHeaders,
}) => {
  return (
    <tr>
      {headers.map(
        ({ value, className, onlyOnDetailed }, i) =>
          (!onlyOnDetailed || detailed === onlyOnDetailed) && (
            <th key={i} className={className}>
              {value}
            </th>
          )
      )}
    </tr>
  );
};

export const FeesBreakdown = ({
  feeFactors,
}: {
  feeFactors: MarketList_markets_fees_factors;
}) => {
  return (
    <table>
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
          <td className={tdClassNames}>{totalFees(feeFactors)}</td>
        </tr>
      </tbody>
    </table>
  );
};

export const SelectMarketTableBody = ({
  data,
  detailed,
  onSelect,
}: {
  data: MarketList | undefined;
  detailed?: boolean;
  onSelect?: (id: string) => void | undefined;
}) => {
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (event.key === 'Enter' && onSelect) {
      return onSelect(id);
    }
  };

  const boldUnderlineClassNames =
    'px-8 underline font-sans text-base leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80 first:w-[10%]';

  const marketList = data && mapDataToMarketList(data);
  return (
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
                    onClick={() => {
                      if (onSelect) {
                        onSelect(market.id);
                      }
                    }}
                    data-testid={`market-link-${market.id}`}
                    className={`focus:decoration-vega-pink dark:focus:decoration-vega-yellow text-black dark:text-white`}
                  >
                    {market.tradableInstrument.instrument.code}
                  </a>
                </Link>
              </td>
              <td className={tdClassNames}>
                {market.lastPrice ? (
                  <PriceCell
                    value={new BigNumber(market.lastPrice).toNumber()}
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
                <td className={thClassNames('left')}>
                  {market.settlementAsset}
                </td>
              )}
              <td className={tdClassNames}>
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
                  <td className={tdClassNames}>
                    {market.candleHigh ? (
                      <PriceCell
                        value={new BigNumber(market.candleHigh).toNumber()}
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
                  <td className={tdClassNames}>
                    {market.candleLow ? (
                      <PriceCell
                        value={new BigNumber(market.candleLow).toNumber()}
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
                  <td className={thClassNames('left')}>
                    {market.tradingMode ===
                      MarketTradingMode.MonitoringAuction &&
                    market.data?.trigger &&
                    market.data.trigger !== AuctionTrigger.Unspecified
                      ? `${formatLabel(
                          market.tradingMode
                        )} - ${market.data?.trigger.toLowerCase()}`
                      : formatLabel(market.tradingMode)}
                  </td>
                  <td className={tdClassNames}>
                    <Tooltip
                      description={
                        <FeesBreakdown feeFactors={market.fees.factors} />
                      }
                    >
                      <span className="border-b-2 border-dotted">
                        {market.totalFees || '-'}
                      </span>
                    </Tooltip>
                  </td>
                  <td className={tdClassNames}>
                    {market.data && market.data.indicativeVolume !== '0'
                      ? addDecimalsFormatNumber(
                          market.data.indicativeVolume,
                          market.positionDecimalPlaces
                        )
                      : '-'}
                  </td>
                  <td className={thClassNames('left')}>{market.name}</td>
                </>
              )}
            </tr>
          );
        })}
    </tbody>
  );
};
