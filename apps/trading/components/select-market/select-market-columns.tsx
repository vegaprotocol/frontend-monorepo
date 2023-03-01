import type { RefObject } from 'react';
import { FeesCell } from '@vegaprotocol/market-info';
import {
  calcCandleHigh,
  calcCandleLow,
  calcCandleVolume,
} from '@vegaprotocol/market-list';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { PriceCell, signedNumberCssClass } from '@vegaprotocol/datagrid';
import { Link as UILink, Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import isNil from 'lodash/isNil';
import type { CandleClose } from '@vegaprotocol/types';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import { Link } from 'react-router-dom';
import { MarketMarkPrice } from '../market-mark-price';
import { Last24hPriceChange } from '../last-24h-price-change';
import { MarketTradingMode } from '../market-trading-mode';
import { Last24hVolume } from '../last-24h-volume';
import { Links, Routes } from '../../pages/client-router';

const ellipsisClasses = 'whitespace-nowrap overflow-hidden text-ellipsis';
export const cellClassNames = `py-1 first:text-left text-right ${ellipsisClasses}`;

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
  ProductType,
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
    kind: ColumnKind.ProductType,
    value: t('Type'),
    className: 'py-2 text-left hidden sm:table-cell',
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
    value: t('24h High'),
    className: `${cellClassNames} hidden xl:table-cell`,
    onlyOnDetailed: true,
  },
  {
    kind: ColumnKind.Low24,
    value: t('24h Low'),
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
  market: MarketMaybeWithDataAndCandles,
  onSelect: (id: string) => void,
  onCellClick: OnCellClickHandler,
  inViewRoot?: RefObject<HTMLElement>
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = market.candles && calcCandleLow(market.candles);
  const candleHigh = market.candles && calcCandleHigh(market.candles);
  const candleVolume = market.candles && calcCandleVolume(market.candles);
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
      kind: ColumnKind.Market,
      value: (
        <Link
          to={Links[Routes.MARKET](market.id)}
          data-testid={`market-link-${market.id}`}
          onKeyPress={(event) => handleKeyPress(event, market.id)}
          onClick={(e) => {
            e.preventDefault();
            onSelect(market.id);
          }}
        >
          <UILink>{market.tradableInstrument.instrument.code}</UILink>
        </Link>
      ),
      className: `${cellClassNames} max-w-[110px]`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.ProductType,
      value: market.tradableInstrument.instrument.product.__typename,
      className: `py-2 text-left hidden sm:table-cell max-w-[50px] ${ellipsisClasses}`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.LastPrice,
      value: (
        <MarketMarkPrice
          marketId={market.id}
          decimalPlaces={market?.decimalPlaces}
          initialValue={market.data?.markPrice}
          inViewRoot={inViewRoot}
          asPriceCell
        />
      ),
      className: `${cellClassNames} max-w-[100px]`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.Change24,
      value: (
        <Last24hPriceChange
          marketId={market.id}
          decimalPlaces={market?.decimalPlaces}
          inViewRoot={inViewRoot}
          initialValue={candlesClose}
        />
      ),
      className: `${cellClassNames} max-w-[150px]`,
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
      className: `${cellClassNames} hidden lg:table-cell max-w-[80px]`,
      onlyOnDetailed: false && candlesClose,
    },
    {
      kind: ColumnKind.Asset,
      value: (
        <button
          data-dialog-trigger
          className="inline underline"
          onClick={(e) => {
            e.stopPropagation();
            onCellClick(
              e,
              ColumnKind.Asset,
              market.tradableInstrument.instrument.product.settlementAsset.id
            );
          }}
        >
          {market.tradableInstrument.instrument.product.settlementAsset.symbol}
        </button>
      ),
      dataTestId: 'settlement-asset',
      className: `${cellClassNames} hidden sm:table-cell max-w-[100px]`,
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
      value: (
        <Last24hVolume
          marketId={market.id}
          positionDecimalPlaces={market.positionDecimalPlaces}
          initialValue={candleVolume}
          inViewRoot={inViewRoot}
          formatDecimals={2}
        />
      ),
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      kind: ColumnKind.TradingMode,
      value: (
        <MarketTradingMode
          marketId={market?.id}
          inViewRoot={inViewRoot}
          initialTradingMode={market.tradingMode}
          initialTrigger={market.data?.trigger}
        />
      ),
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
  market: MarketMaybeWithDataAndCandles,
  onSelect: (id: string) => void,
  inViewRoot?: RefObject<HTMLElement>,
  openVolume?: string,
  onCellClick?: OnCellClickHandler
) => {
  const candlesClose = market.candles
    ?.map((candle) => candle?.close)
    .filter((c: string | undefined): c is CandleClose => !isNil(c));
  const candleLow = market.candles && calcCandleLow(market.candles);
  const candleHigh = market.candles && calcCandleHigh(market.candles);
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLSpanElement>,
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
        <Link
          to={Links[Routes.MARKET](market.id)}
          data-testid={`market-link-${market.id}`}
          onKeyPress={(event) => handleKeyPress(event, market.id)}
          onClick={(e) => {
            e.preventDefault();
            onSelect(market.id);
          }}
        >
          <UILink>{market.tradableInstrument.instrument.code}</UILink>
        </Link>
      ),
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.ProductType,
      value: market.tradableInstrument.instrument.product.__typename,
      className: `py-2 first:text-left hidden sm:table-cell`,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.LastPrice,
      value: (
        <MarketMarkPrice
          marketId={market.id}
          decimalPlaces={market?.decimalPlaces}
          inViewRoot={inViewRoot}
          initialValue={market.data?.markPrice}
          asPriceCell
        />
      ),
      className: cellClassNames,
      onlyOnDetailed: false,
    },
    {
      kind: ColumnKind.Change24,
      value: (
        <Last24hPriceChange
          marketId={market.id}
          decimalPlaces={market?.decimalPlaces}
          inViewRoot={inViewRoot}
          initialValue={candlesClose}
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
          className="inline underline"
          onClick={(e) => {
            e.stopPropagation();
            if (!onCellClick) return;
            onCellClick(
              e,
              ColumnKind.Asset,
              market.tradableInstrument.instrument.product.settlementAsset.id
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
      kind: ColumnKind.Volume,
      value: (
        <Last24hVolume
          marketId={market.id}
          inViewRoot={inViewRoot}
          positionDecimalPlaces={market.positionDecimalPlaces}
          initialValue={candleVolume}
          formatDecimals={2}
        />
      ),
      className: `${cellClassNames} hidden lg:table-cell font-mono`,
      onlyOnDetailed: true,
      dataTestId: 'market-volume',
    },
    {
      kind: ColumnKind.TradingMode,
      value: (
        <MarketTradingMode
          marketId={market?.id}
          inViewRoot={inViewRoot}
          initialTradingMode={market.tradingMode}
          initialTrigger={market.data?.trigger}
        />
      ),
      className: `${cellClassNames} hidden lg:table-cell`,
      onlyOnDetailed: true,
      dataTestId: 'trading-mode-col',
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
        <p className={signedNumberCssClass(openVolume || '')}>
          {openVolume &&
            addDecimalsFormatNumber(openVolume, market.positionDecimalPlaces)}
        </p>
      ),
      className: `${cellClassNames} hidden xxl:table-cell font-mono`,
      onlyOnDetailed: true,
    },
  ];
  return selectMarketColumns;
};
