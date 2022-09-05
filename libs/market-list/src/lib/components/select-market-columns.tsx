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
import { PriceCellChange, Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import Link from 'next/link';

import { calcCandleHigh, calcCandleLow, totalFees } from '../utils';

import type { CandleClose } from '@vegaprotocol/types';
import type {
  MarketList_markets,
  MarketList_markets_fees_factors,
} from '../__generated__/MarketList';
import isNil from 'lodash/isNil';

export const cellClassNames = 'px-0 py-1 first:text-left text-right';

const FeesInfo = () => {
  return (
    <Tooltip
      description={
        <span>
          {t(
            'Fees are paid by market takers on aggressive orders only. The fee displayed is made up of:'
          )}
          <ul className="list-disc ml-4">
            <li>{t('An infrastructure fee')}</li>
            <li>{t('A liquidity provision fee')}</li>
            <li>{t('A maker fee')}</li>
          </ul>
        </span>
      }
    >
      <span>{t('Taker fee')}</span>
    </Tooltip>
  );
};

export interface Column {
  value: string | React.ReactNode;
  className: string;
  onlyOnDetailed: boolean;
  dataTestId?: string;
}

export const columnHeadersPositionMarkets: Column[] = [
  {
    value: t('Market'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Last price'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Change (24h)'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Settlement asset'),
    className: `${cellClassNames} hidden sm:table-cell`,
    onlyOnDetailed: false,
  },
  {
    value: t(''),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: false,
  },
  {
    value: t('24h high'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('24h low'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Trading mode'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Volume'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: <FeesInfo />,
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Position'),
    className: `${cellClassNames} hidden xxl:table-cell`,
    onlyOnDetailed: true,
  },
];

export const columnHeaders: Column[] = [
  {
    value: t('Market'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Last price'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Change (24h)'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    value: t('Settlement asset'),
    className: `${cellClassNames} hidden sm:table-cell`,
    onlyOnDetailed: false,
  },
  {
    value: t(''),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: false,
  },
  {
    value: t('24h high'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('24h low'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Trading mode'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Volume'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: <FeesInfo />,
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('Full name'),
    className: `${cellClassNames} hidden xxl:block`,
    onlyOnDetailed: true,
  },
];

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
      className: cellClassNames,
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
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      value: candlesClose && (
        <PriceCellChange
          candles={candlesClose}
          decimalPlaces={market.decimalPlaces}
        />
      ),
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      value:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      dataTestId: 'settlement-asset',
      className: `${cellClassNames} hidden sm:table-cell`,
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
      className: `${cellClassNames} hidden lg:table-cell`,
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
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
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
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
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
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value:
        market.data?.indicativeVolume && market.data.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
              market.data.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'taker-fee',
    },
    {
      value: market.name,
      className: `${cellClassNames} hidden xxl:block`,
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
      className: cellClassNames,
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
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      value: candlesClose && (
        <PriceCellChange
          candles={candlesClose}
          decimalPlaces={market.decimalPlaces}
        />
      ),
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      value:
        market.tradableInstrument.instrument.product.settlementAsset.symbol,
      className: `${cellClassNames} hidden sm:table-cell`,
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
      className: `${cellClassNames} hidden lg:table-cell`,
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
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
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
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
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
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value:
        market.data && market.data.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
              market.data.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
    },
    {
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
      onlyOnDetailed: true,
    },
    {
      value: (
        <p
          className={
            market.openVolume.includes('+')
              ? 'text-vega-green-dark dark:text-vega-green'
              : market.openVolume.includes('-')
              ? 'text-vega-red-dark dark:text-vega-red'
              : ''
          }
        >
          {market.openVolume}
        </p>
      ),
      className: `${cellClassNames} hidden xxl:table-cell font-mono`,
      onlyOnDetailed: true,
    },
  ];
  return selectMarketColumns;
};

const FeesCell = ({
  feeFactors,
}: {
  feeFactors: MarketList_markets_fees_factors;
}) => (
  <Tooltip description={<FeesBreakdown feeFactors={feeFactors} />}>
    <span>{totalFees(feeFactors) ?? '-'}</span>
  </Tooltip>
);

export const FeesBreakdown = ({
  feeFactors,
}: {
  feeFactors?: MarketList_markets_fees_factors;
}) => {
  if (!feeFactors) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-2">
      <dt>{t('Infrastructure fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.infrastructureFee).times(100)
        )}
      </dd>
      <dt>{t('Liquidity fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.liquidityFee).times(100)
        )}
      </dd>
      <dt>{t('Maker fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(new BigNumber(feeFactors.makerFee).times(100))}
      </dd>
      <dt>{t('Total fees')}</dt>
      <dd className="text-right">{totalFees(feeFactors)}</dd>
    </dl>
  );
};
