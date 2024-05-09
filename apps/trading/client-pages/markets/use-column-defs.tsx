import { useMemo } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { MarketProductPill, StackedCell } from '@vegaprotocol/datagrid';
import {
  addDecimalsFormatNumber,
  formatNumber,
  priceChange,
  toBigNum,
} from '@vegaprotocol/utils';
import { Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import type {
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';
import {
  Last24hPriceChange,
  calcCandleVolume,
  calcCandleVolumePrice,
  getQuoteAsset,
  getQuoteName,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { MarketIcon, getTradingModeTooltip } from './market-icon';

const openInterestRenderer = (data: MarketMaybeWithData | undefined) => {
  if (!data) return '-';
  const { data: marketData, positionDecimalPlaces, decimalPlaces } = data;
  if (!marketData) return '-';
  const { openInterest, markPrice } = marketData;
  const quoteName = getQuoteName(data);
  const openInterestPosition =
    openInterest === undefined
      ? '-'
      : addDecimalsFormatNumber(openInterest, positionDecimalPlaces);
  const openInterestValue = toBigNum(
    openInterest,
    positionDecimalPlaces
  ).multipliedBy(toBigNum(markPrice, decimalPlaces));

  const openInterestNotional =
    quoteName === 'USDT'
      ? `$${formatNumber(openInterestValue, 2)}`
      : `${formatNumber(openInterestValue, 2)} ${quoteName}`;
  return (
    <StackedCell
      primary={openInterestPosition}
      secondary={openInterestNotional}
    />
  );
};

export const priceChangeRenderer = (
  data: MarketMaybeWithDataAndCandles | undefined,
  showChangeValue = true
) => {
  if (!data) return null;
  return (
    <Last24hPriceChange
      marketId={data.id}
      decimalPlaces={data.decimalPlaces}
      orientation="vertical"
      showChangeValue={showChangeValue}
      fallback={
        <span className="leading-4">
          <div className="text-ellipsis whitespace-nowrap overflow-hidden">
            <span data-testid="price-change-percentage">{'0.00%'}</span>
          </div>
          {showChangeValue && (
            <span
              data-testid="price-change"
              className="text-ellipsis whitespace-nowrap overflow-hidden text-muted"
            >
              ({'0.00'})
            </span>
          )}
        </span>
      }
    />
  );
};

export const priceChangeSparklineRenderer = (
  data: MarketMaybeWithDataAndCandles | undefined
) => {
  if (!data) return null;
  const candles = data.candles
    ?.filter((c) => c.close)
    .map((c) => Number(c.close));
  return <Sparkline width={80} height={20} data={candles || [0]} />;
};

export const priceValueFormatter = (
  data: MarketMaybeWithData | undefined,
  formatDecimalPlaces?: number
): string => {
  if (data?.tradableInstrument.instrument.product.__typename === 'Spot') {
    const quoteAsset = data && getQuoteAsset(data);
    return data?.data?.lastTradedPrice === undefined
      ? '-'
      : `${addDecimalsFormatNumber(
          data.data.lastTradedPrice,
          data.decimalPlaces
        )} ${quoteAsset?.symbol}`;
  }
  const quoteName = data && getQuoteName(data);

  return data?.data?.bestOfferPrice === undefined
    ? '-'
    : quoteName === 'USDT'
    ? `$${addDecimalsFormatNumber(
        data.data.markPrice,
        data.decimalPlaces,
        formatDecimalPlaces
      )}`
    : `${addDecimalsFormatNumber(
        data.data.markPrice,
        data.decimalPlaces,
        formatDecimalPlaces
      )} ${quoteName}`;
};

export const useMarketsColumnDefs = () => {
  const t = useT();
  const { chainId } = useChainId();

  return useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Market'),
        field: 'tradableInstrument.instrument.code',
        minWidth: 150,
        pinned: true,
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<
          MarketMaybeWithData,
          'tradableInstrument.instrument.code'
        >) => {
          const tradingMode = data?.data?.marketTradingMode;
          const state = data?.data?.marketState;
          const tooltip = getTradingModeTooltip(state, tradingMode);
          const productType =
            data?.tradableInstrument.instrument.product.__typename;
          return (
            <Tooltip description={t(tooltip)}>
              <span className="flex items-center gap-2 cursor-pointer">
                <span className="mr-2">
                  <EmblemByMarket market={data?.id || ''} vegaChain={chainId} />
                </span>
                <StackedCell
                  primary={value}
                  secondary={data?.tradableInstrument.instrument.name}
                  primaryIcon={
                    <>
                      <span>
                        <MarketIcon data={data} />
                      </span>
                      <span className="ml-0.5">
                        <MarketProductPill productType={productType} />
                      </span>
                    </>
                  }
                />
              </span>
            </Tooltip>
          );
        },
      },
      {
        headerName: t('Price'),
        field: 'data.markPrice',
        type: 'rightAligned',
        cellRenderer: 'PriceFlashCell',
        filter: 'agNumberColumnFilter',
        maxWidth: 150,
        valueGetter: ({ data }: VegaValueGetterParams<MarketMaybeWithData>) => {
          if (
            data?.tradableInstrument.instrument.product.__typename === 'Spot'
          ) {
            return data?.data?.lastTradedPrice === undefined
              ? undefined
              : toBigNum(
                  data?.data?.lastTradedPrice,
                  data.decimalPlaces
                ).toNumber();
          }
          return data?.data?.markPrice === undefined
            ? undefined
            : toBigNum(data?.data?.markPrice, data.decimalPlaces).toNumber();
        },
        valueFormatter: ({
          data,
        }: VegaValueFormatterParams<MarketMaybeWithData, 'data.markPrice'>) => {
          return priceValueFormatter(data);
        },
      },
      {
        headerName: '24h Change',
        field: 'data.candles',
        type: 'rightAligned',
        cellRenderer: ({
          data,
        }: ValueFormatterParams<MarketMaybeWithDataAndCandles, 'candles'>) => {
          return (
            <div className="flex flex-row gap-2 justify-end">
              <span>{priceChangeRenderer(data)}</span>
              <span>{priceChangeSparklineRenderer(data)}</span>
            </div>
          );
        },
        valueGetter: ({
          data,
        }: VegaValueGetterParams<MarketMaybeWithDataAndCandles>) => {
          if (!data) return 0;
          const candles = data?.candles?.map((c) => c.close);
          const change = candles ? priceChange(candles) : 0;
          return change;
        },
      },
      {
        headerName: t('24h Volume'),
        type: 'rightAligned',
        field: 'data.candles',
        valueGetter: ({
          data,
        }: VegaValueGetterParams<MarketMaybeWithDataAndCandles>) => {
          if (!data) return 0;
          const candles = data?.candles;
          const vol = candles ? calcCandleVolume(candles) : '0';
          return Number(vol);
        },
        cellRenderer: ({
          data,
        }: ValueFormatterParams<MarketMaybeWithDataAndCandles, 'candles'>) => {
          if (!data) return '-';
          const candles = data.candles;
          const vol = candles ? calcCandleVolume(candles) : '0';
          const quoteName = getQuoteName(data);
          const volPrice =
            candles &&
            calcCandleVolumePrice(
              candles,
              data.decimalPlaces,
              data.positionDecimalPlaces
            );

          const volume =
            data && vol && vol !== '0'
              ? addDecimalsFormatNumber(vol, data.positionDecimalPlaces, 2)
              : '0.00';
          const volumePrice = volPrice && formatNumber(volPrice, 2);

          return volumePrice ? (
            <span className="font-mono">
              <StackedCell
                primary={volume}
                secondary={
                  quoteName === 'USDT'
                    ? `$${volumePrice}`
                    : `${volumePrice} ${quoteName}`
                }
              />
            </span>
          ) : (
            <StackedCell primary={volume} secondary={''} />
          );
        },
      },
      {
        headerName: t('Open interest'),
        field: 'data.openInterest',
        type: 'rightAligned',
        cellRenderer: ({
          data,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.openInterest'
        >) => {
          return (
            <span className="font-mono">{openInterestRenderer(data)}</span>
          );
        },
      },
    ],
    [chainId, t]
  );
};
