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

import { totalFees } from '../utils';

import type { CandleClose } from '@vegaprotocol/types';
import type { MarketList_markets_fees_factors } from '../__generated__/MarketList';
import classNames from 'classnames';

export const thClassNames = (direction: 'left' | 'right') =>
  `px-8 text-${direction} font-sans text-ui-small leading-9 mb-0 text-dark dark:text-white first:w-[10%]`;
export const tdClassNames =
  'px-8 font-sans leading-9 capitalize text-ui-small text-right text-dark dark:text-white';
export const boldUnderlineClassNames = classNames(
  'px-8 underline font-sans',
  'leading-9 font-bold tracking-tight decoration-solid',
  'text-ui light:hover:text-black/80 dark:hover:text-white/80',
  'first:w-[10%]'
);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns = (market: any, onSelect?: (id: string) => void) => {
  const candlesClose = market.candles
    .map((candle: { close: string }) => candle?.close)
    .filter((c: string): c is CandleClose => c !== null);
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (event.key === 'Enter' && onSelect) {
      return onSelect(id);
    }
  };
  const selectMarketColumns: Column[] = [
    {
      value: (
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
      ),
      className: `${boldUnderlineClassNames} relative`,
      onlyOnDetailed: false,
    },
    {
      value: market.lastPrice ? (
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
      ),
      className: tdClassNames,
      onlyOnDetailed: false,
    },
    {
      value: market.settlementAsset,
      className: thClassNames('left'),
      onlyOnDetailed: false,
    },
    {
      value: (
        <PriceCellChange
          candles={candlesClose}
          decimalPlaces={market.decimalPlaces}
        />
      ),
      className: tdClassNames,
      onlyOnDetailed: false,
    },
    {
      value: market.candles && (
        <Sparkline
          width={100}
          height={20}
          muted={false}
          data={candlesClose.map((c: string) => Number(c))}
        />
      ),
      className: 'px-8',
      onlyOnDetailed: false,
    },
    {
      value: market.candleHigh ? (
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
      ),
      className: tdClassNames,
      onlyOnDetailed: true,
    },
    {
      value: market.candleLow ? (
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
      ),
      className: tdClassNames,
      onlyOnDetailed: true,
    },
    {
      value:
        market.tradingMode === MarketTradingMode.MonitoringAuction &&
          market.data?.trigger &&
          market.data.trigger !== AuctionTrigger.Unspecified
          ? `${formatLabel(
            market.tradingMode
          )} - ${market.data?.trigger.toLowerCase()}`
          : formatLabel(market.tradingMode),
      className: thClassNames('left'),
      onlyOnDetailed: true,
    },
    {
      value: (
        <Tooltip
          description={<FeesBreakdown feeFactors={market.fees.factors} />}
        >
          <span className="border-b-2 border-dotted">
            {market.totalFees ?? '-'}
          </span>
        </Tooltip>
      ),
      className: tdClassNames,
      onlyOnDetailed: true,
    },
    {
      value:
        market.data && market.data.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
            market.data.indicativeVolume,
            market.positionDecimalPlaces
          )
          : '-',
      className: tdClassNames,
      onlyOnDetailed: true,
    },
    {
      value: market.name,
      className: thClassNames('left'),
      onlyOnDetailed: true,
    },
    {
      value: market.openVolume,
      className: thClassNames('right'),
      onlyOnDetailed: true,
    },
  ];
  return selectMarketColumns;
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
