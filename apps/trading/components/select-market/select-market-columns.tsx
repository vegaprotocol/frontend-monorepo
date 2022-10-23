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
import {
  calcCandleHigh,
  calcCandleLow,
  calcCandleVolume,
  totalFees,
} from '@vegaprotocol/market-list';
import type { CandleClose } from '@vegaprotocol/types';
import type {
  MarketWithData,
  MarketWithCandles,
} from '@vegaprotocol/market-list';
import isNil from 'lodash/isNil';

type Market = MarketWithData & MarketWithCandles;

export const cellClassNames = 'py-1 first:text-left text-right';

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

export enum ColumnKind {
  Market,
  LastPrice,
  Change24,
  Asset,
  Sparkline,
  High24,
  Low24,
  TradingMode,
  Volume,
  Fee,
  Position,
  FullName,
}

export interface Column {
  kind: ColumnKind;
  value: string | React.ReactNode;
  className: string;
  onlyOnDetailed: boolean;
  dataTestId?: string;
}

const headers: Column[] = [
  {
    kind: ColumnKind.Market,
    value: t('Market'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    kind: ColumnKind.LastPrice,
    value: t('Last price'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    kind: ColumnKind.Change24,
    value: t('Change (24h)'),
    className: cellClassNames,
    onlyOnDetailed: false,
  },
  {
    kind: ColumnKind.Sparkline,
    value: t(''),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: false,
  },
  {
    kind: ColumnKind.Asset,
    value: t('Settlement asset'),
    className: `${cellClassNames} hidden sm:table-cell`,
    onlyOnDetailed: false,
  },
  {
    kind: ColumnKind.High24,
    value: t('24h high'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    kind: ColumnKind.Low24,
    value: t('24h low'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    kind: ColumnKind.Volume,
    value: t('24h Volume'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    kind: ColumnKind.TradingMode,
    value: t('Trading mode'),
    className: `${cellClassNames} hidden lg:table-cell`,
    onlyOnDetailed: true,
  },
  {
    kind: ColumnKind.Fee,
    value: <FeesInfo />,
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
];

export const columnHeadersPositionMarkets: Column[] = [
  ...headers,
  {
    kind: ColumnKind.Position,
    value: t('Position'),
    className: `${cellClassNames} hidden xxl:table-cell`,
    onlyOnDetailed: true,
  },
];

export const columnHeaders: Column[] = [
  ...headers,
  {
    kind: ColumnKind.FullName,
    value: t('Full name'),
    className: `${cellClassNames} hidden xxl:block`,
    onlyOnDetailed: true,
  },
];

export type OnCellClickHandler = (
  e: React.MouseEvent,
  kind: ColumnKind,
  value: string
) => void;

export const columns = (
  market: Market,
  onSelect: (id: string) => void,
  onCellClick: OnCellClickHandler
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = market.candles && calcCandleLow(market.candles);
  const candleHigh = market.candles && calcCandleHigh(market.candles);
  const candleVolume = market.candles && calcCandleVolume(market.candles);
  const selectMarketColumns: Column[] = [
    {
      kind: ColumnKind.Market,
      value: market.tradableInstrument.instrument.code,
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.LastPrice,
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
      kind: ColumnKind.Change24,
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
      kind: ColumnKind.Sparkline,
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
      kind: ColumnKind.Asset,
      value: (
        <button
          data-dialog-trigger
          className="inline hover:underline"
          onClick={(e) =>
            onCellClick(
              e,
              ColumnKind.Asset,
              market.tradableInstrument.instrument.product.settlementAsset
                .symbol
            )
          }
        >
          {market.tradableInstrument.instrument.product.settlementAsset.symbol}
        </button>
      ),
      dataTestId: 'settlement-asset',
      className: `${cellClassNames} hidden sm:table-cell`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.High24,
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
      kind: ColumnKind.Low24,
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
      kind: ColumnKind.Volume,
      value: candleVolume
        ? addDecimalsFormatNumber(
            candleVolume.toString(),
            market.positionDecimalPlaces,
            2
          )
        : '-',
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      kind: ColumnKind.TradingMode,
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
      dataTestId: 'trading-mode-col',
    },
    {
      kind: ColumnKind.Fee,
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'taker-fee',
    },
    {
      kind: ColumnKind.FullName,
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
  onSelect: (id: string) => void,
  openVolume?: string,
  onCellClick?: OnCellClickHandler
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = market.candles && calcCandleLow(market.candles);
  const candleHigh = market.candles && calcCandleHigh(market.candles);
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (event.key === 'Enter' && onSelect) {
      return onSelect(id);
    }
  };
  const candleVolume = market.candles && calcCandleVolume(market.candles);
  const selectMarketColumns: Column[] = [
    {
      kind: ColumnKind.Market,
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
      kind: ColumnKind.LastPrice,
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
      kind: ColumnKind.Change24,
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
      kind: ColumnKind.Sparkline,
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
      kind: ColumnKind.Asset,
      value: (
        <button
          data-dialog-trigger
          className="inline hover:underline"
          onClick={(e) => {
            if (!onCellClick) return;
            onCellClick(
              e,
              ColumnKind.Asset,
              market.tradableInstrument.instrument.product.settlementAsset
                .symbol
            );
          }}
        >
          {market.tradableInstrument.instrument.product.settlementAsset.symbol}
        </button>
      ),
      className: `${cellClassNames} hidden sm:table-cell`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.High24,
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
      kind: ColumnKind.Low24,
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
      kind: ColumnKind.TradingMode,
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
      dataTestId: 'trading-mode-col',
    },
    {
      kind: ColumnKind.Volume,
      value: candleVolume
        ? addDecimalsFormatNumber(
            candleVolume.toString(),
            market.positionDecimalPlaces,
            2
          )
        : '-',
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      kind: ColumnKind.Fee,
      value: <FeesCell feeFactors={market.fees.factors} />,
      className: `${cellClassNames} hidden xl:table-cell font-mono`,
      onlyOnDetailed: true,
    },
    {
      kind: ColumnKind.Position,
      value: (
        <p className={signedNumberCssClass(openVolume || '')}>{openVolume}</p>
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
