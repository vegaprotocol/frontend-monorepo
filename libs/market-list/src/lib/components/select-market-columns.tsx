/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  PriceCell,
  signedNumberCssClass,
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
import type { Market, MarketData, Candle } from '../';
import isNil from 'lodash/isNil';

export const cellClassNames = 'px-2 py-1 first:text-left text-right capitalize';

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
    value: t('24h High'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('24h Low'),
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
    value: t('24h High'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    value: t('24h Low'),
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
  market: Market,
  marketData: MarketData | undefined,
  candles: Candle[] | undefined,
  onSelect: (id: string) => void
) => {
  const candlesClose = candles
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
  const candleLow = candles && calcCandleLow(candles);
  const candleHigh = candles && calcCandleHigh(candles);
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
      value: marketData?.markPrice ? (
        <PriceCell
          value={Number(marketData?.markPrice)}
          valueFormatted={addDecimalsFormatNumber(
            marketData?.markPrice.toString(),
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
      value: candles && (
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
      className: `${cellClassNames} hidden xl:table-cell`,
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
      className: `${cellClassNames} hidden xl:table-cell`,
      onlyOnDetailed: true,
    },
    {
      value:
        market.tradingMode ===
          MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
        marketData?.trigger &&
        marketData.trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
          ? `${MarketTradingModeMapping[market.tradingMode]}
                     - ${AuctionTriggerMapping[marketData.trigger]}`
          : MarketTradingModeMapping[market.tradingMode],
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value:
        marketData?.indicativeVolume && marketData.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
              marketData.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'taker-fee',
    },
    {
      value: market.tradableInstrument.instrument.name,
      className: `${cellClassNames} hidden xxl:block`,
      onlyOnDetailed: true,
      dataTestId: 'market-name',
    },
  ];
  return selectMarketColumns;
};

export const columnsPositionMarkets = (
  market: Market,
  marketData: MarketData | undefined,
  candles: Candle[] | undefined,
  onSelect: (id: string) => void,
  openVolume?: string
) => {
  const candlesClose = candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = candles && calcCandleLow(candles);
  const candleHigh = candles && calcCandleHigh(candles);
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
      value: marketData?.markPrice ? (
        <PriceCell
          value={Number(marketData.markPrice)}
          valueFormatted={addDecimalsFormatNumber(
            marketData.markPrice.toString(),
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
      className: `${cellClassNames} hidden xl:table-cell`,
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
      className: `${cellClassNames} hidden xl:table-cell`,
      onlyOnDetailed: true,
    },
    {
      value:
        market.tradingMode ===
          MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
        marketData?.trigger &&
        marketData.trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
          ? `${MarketTradingModeMapping[market.tradingMode]}
                     - ${AuctionTriggerMapping[marketData.trigger]}`
          : MarketTradingModeMapping[market.tradingMode],
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'trading-mode',
    },
    {
      value:
        marketData && marketData.indicativeVolume !== '0'
          ? addDecimalsFormatNumber(
              marketData.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
    },
    {
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell`,
      onlyOnDetailed: true,
    },
    {
      value: (
        <p className={signedNumberCssClass(openVolume || '')}>{openVolume}</p>
      ),
      className: `${cellClassNames} hidden xxl:table-cell`,
      onlyOnDetailed: true,
    },
  ];
  return selectMarketColumns;
};

const FeesCell = ({
  feeFactors,
}: {
  feeFactors: Market['fees']['factors'];
}) => (
  <Tooltip description={<FeesBreakdown feeFactors={feeFactors} />}>
    <span>{totalFees(feeFactors) ?? '-'}</span>
  </Tooltip>
);

export const FeesBreakdown = ({
  feeFactors,
}: {
  feeFactors?: Market['fees']['factors'];
}) => {
  if (!feeFactors) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-2">
      <dt>{t('Infrastructure Fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.infrastructureFee).times(100)
        )}
      </dd>
      <dt>{t('Liquidity Fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.liquidityFee).times(100)
        )}
      </dd>
      <dt>{t('Maker Fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(new BigNumber(feeFactors.makerFee).times(100))}
      </dd>
      <dt>{t('Total Fees')}</dt>
      <dd className="text-right">{totalFees(feeFactors)}</dd>
    </dl>
  );
};
