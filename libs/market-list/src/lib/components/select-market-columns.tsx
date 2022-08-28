/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AuctionTrigger,
  AuctionTriggerMapping,
  MarketTradingMode,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import {
  KeyValueTable,
  KeyValueTableRow,
  PriceCellChange,
  Sparkline,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import Link from 'next/link';

import { calcCandleHigh, calcCandleLow, totalFees } from '../utils';

import type { CandleClose } from '@vegaprotocol/types';
import type {
  MarketList_markets,
  MarketList_markets_fees_factors,
} from '../__generated__/MarketList';
import classNames from 'classnames';
import isNil from 'lodash/isNil';

export const thClassNames = (direction: 'left' | 'right') =>
  `px-2 text-${direction} first:w-[10%]`;
export const tdClassNames = 'px-2 capitalize text-right';
export const boldUnderlineClassNames = classNames(
  'px-2 underline',
  'first:w-[10%]'
);

export interface Column {
  value: string | React.ReactNode;
  className: string;
  onlyOnDetailed: boolean;
  dataTestId?: string;
}

export const columnHeadersPositionMarkets: Column[] = [
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
    onlyOnDetailed: false,
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
          <span>
            {t(
              'Fees are paid by market takers on aggressive orders only. The fee displayed is made up of:'
            )}
            <ul className="list-disc ml-4">
              <li className="py-2">{t('An infrastructure fee')}</li>
              <li className="py-2">{t('A liquidity provision fee')}</li>
              <li className="py-2">{t('A maker fee')}</li>
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
    value: t('Position'),
    className: thClassNames('left'),
    onlyOnDetailed: true,
  },
];

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
    onlyOnDetailed: false,
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
          <span>
            {t(
              'Fees are paid by market takers on aggressive orders only. The fee displayed is made up of:'
            )}
            <ul className="list-disc ml-4">
              <li className="py-2">{t('An infrastructure fee')}</li>
              <li className="py-2">{t('A liquidity provision fee')}</li>
              <li className="py-2">{t('A maker fee')}</li>
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
export const columns = (
  market: MarketList_markets,
  onSelect: (id: string) => void
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (event.key === 'Enter' && onSelect) {
      return onSelect(id);
    }
  };
  const candleLow = calcCandleLow(market);
  const candleHigh = calcCandleHigh(market);
  const selectMarketColumns: Column[] = [
    {
      value: (
        <Link href={`/markets/${market.id}`} passHref={true}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid,jsx-a11y/no-static-element-interactions */}
          <a
            onKeyPress={(event) => handleKeyPress(event, market.id)}
            onClick={() => {
              onSelect(market.id);
            }}
            data-testid={`market-link-${market.id}`}
          >
            {market.tradableInstrument.instrument.code}
          </a>
        </Link>
      ),
      className: `${boldUnderlineClassNames} relative`,
      onlyOnDetailed: false,
    },
    {
      value: market.data?.markPrice ? (
        <PriceCell
          value={Number(market.data?.markPrice)}
          valueFormatted={addDecimalsFormatNumber(
            market.data?.markPrice.toString(),
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
      value:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      dataTestId: 'settlement-asset',
      className: thClassNames('left'),
      onlyOnDetailed: false,
    },
    {
      value: candlesClose && (
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
          data={candlesClose?.map((c: string) => Number(c)) || []}
        />
      ),
      className: 'px-2',
      onlyOnDetailed: false && candlesClose,
    },
    {
      value: candleHigh ? (
        <PriceCell
          value={Number(candleHigh)}
          valueFormatted={addDecimalsFormatNumber(
            candleHigh.toString(),
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
      value: candleLow ? (
        <PriceCell
          value={Number(candleLow)}
          valueFormatted={addDecimalsFormatNumber(
            candleLow.toString(),
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
        market.tradingMode ===
          MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
        market.data?.trigger &&
        market.data.trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
          ? `${MarketTradingModeMapping[market.tradingMode]}
                     - ${AuctionTriggerMapping[market.data.trigger]}`
          : MarketTradingModeMapping[market.tradingMode],
      className: thClassNames('left'),
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value: (
        <Tooltip
          description={<FeesBreakdown feeFactors={market.fees.factors} />}
        >
          <span className="border-b-2 border-dotted">
            {totalFees(market.fees.factors) ?? '-'}
          </span>
        </Tooltip>
      ),
      className: tdClassNames,
      onlyOnDetailed: true,
      dataTestId: 'taker-fee',
    },
    {
      value:
        market.data?.indicativeVolume && market.data.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
              market.data.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
      className: tdClassNames,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      value: market.name,
      className: thClassNames('left'),
      onlyOnDetailed: true,
      dataTestId: 'market-name',
    },
  ];
  return selectMarketColumns;
};

export const columnsPositionMarkets = (
  market: MarketList_markets & { openVolume: string },
  onSelect: (id: string) => void
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = calcCandleLow(market);
  const candleHigh = calcCandleHigh(market);
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
              onSelect(market.id);
            }}
            data-testid={`market-link-${market.id}`}
          >
            {market.tradableInstrument.instrument.code}
          </a>
        </Link>
      ),
      className: `${boldUnderlineClassNames} relative`,
      onlyOnDetailed: false,
    },
    {
      value: market.data?.markPrice ? (
        <PriceCell
          value={Number(market.data.markPrice)}
          valueFormatted={addDecimalsFormatNumber(
            market.data.markPrice.toString(),
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
      value:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      className: thClassNames('left'),
      onlyOnDetailed: false,
    },
    {
      value: candlesClose && (
        <PriceCellChange
          candles={candlesClose}
          decimalPlaces={market.decimalPlaces}
        />
      ),
      className: tdClassNames,
      onlyOnDetailed: false,
    },
    {
      value: candlesClose && (
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
      value: candleHigh ? (
        <PriceCell
          value={Number(candleHigh)}
          valueFormatted={addDecimalsFormatNumber(
            candleHigh.toString(),
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
      value: candleLow ? (
        <PriceCell
          value={Number(candleLow)}
          valueFormatted={addDecimalsFormatNumber(
            candleLow.toString(),
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
        market.tradingMode ===
          MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
        market.data?.trigger &&
        market.data.trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
          ? `${MarketTradingModeMapping[market.tradingMode]}
                     - ${AuctionTriggerMapping[market.data.trigger]}`
          : MarketTradingModeMapping[market.tradingMode],
      className: thClassNames('left'),
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value: (
        <Tooltip
          description={<FeesBreakdown feeFactors={market.fees?.factors} />}
        >
          <span className="border-b-2 border-dotted">
            {totalFees(market.fees.factors) ?? '-'}
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
      value: (
        <p
          className={
            market.openVolume.includes('+')
              ? 'text-vega-green'
              : market.openVolume.includes('-')
              ? 'text-vega-red'
              : ''
          }
        >
          {market.openVolume}
        </p>
      ),
      className: thClassNames('left'),
      onlyOnDetailed: true,
    },
  ];
  return selectMarketColumns;
};

export const FeesBreakdown = ({
  feeFactors,
}: {
  feeFactors?: MarketList_markets_fees_factors;
}) => {
  if (!feeFactors) return null;
  return (
    <KeyValueTable>
      <KeyValueTableRow>
        <span className={thClassNames('left')}>{t('Infrastructure Fee')}</span>
        <span className={tdClassNames}>
          {formatNumberPercentage(
            new BigNumber(feeFactors.infrastructureFee).times(100)
          )}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span className={thClassNames('left')}>{t('Liquidity Fee')}</span>
        <span className={tdClassNames}>
          {formatNumberPercentage(
            new BigNumber(feeFactors.liquidityFee).times(100)
          )}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span className={thClassNames('left')}>{t('Maker Fee')}</span>
        <span className={tdClassNames}>
          {formatNumberPercentage(
            new BigNumber(feeFactors.makerFee).times(100)
          )}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span className={thClassNames('left')}>{t('Total Fees')}</span>
        <span className={tdClassNames}>{totalFees(feeFactors)}</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
