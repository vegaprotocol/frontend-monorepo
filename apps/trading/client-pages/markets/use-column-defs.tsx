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
  priceChangePercentage,
  toBigNum,
} from '@vegaprotocol/utils';
import { Sparkline, Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  type Market,
  getQuoteAsset,
  getQuoteName,
  isSpot,
} from '@vegaprotocol/data-provider';
import {
  Last24hPriceChange,
  calcCandleVolume,
  calcCandleVolumePrice,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { MarketIcon, getMarketStateTooltip } from './market-icon';

const openInterestValues = (data: Market) => {
  if (!data) return null;
  const { data: marketData, positionDecimalPlaces, decimalPlaces } = data;
  if (!marketData) return null;
  const { openInterest, markPrice } = marketData;

  const openInterestPosition =
    openInterest === undefined
      ? '-'
      : addDecimalsFormatNumber(openInterest, positionDecimalPlaces);
  const openInterestNotional = toBigNum(
    openInterest,
    positionDecimalPlaces
  ).multipliedBy(toBigNum(markPrice, decimalPlaces));

  return {
    openInterest: openInterestPosition,
    openInterestNotional,
  };
};

const OpenInterestCell = ({ data }: { data: Market | undefined }) => {
  const openInterestData = data && openInterestValues(data);
  if (!openInterestData) return null;
  const { openInterest, openInterestNotional } = openInterestData;
  const quoteName = getQuoteName(data);
  const openInterestNotionalFormatted =
    quoteName === 'USDT'
      ? `$${formatNumber(openInterestNotional, 0)}`
      : `${formatNumber(openInterestNotional, 0)} ${quoteName}`;
  return (
    <StackedCell
      primary={openInterest}
      secondary={openInterestNotionalFormatted}
    />
  );
};

export const priceValueFormatter = (
  data: Market | undefined,
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
          Market,
          'tradableInstrument.instrument.code'
        >) => {
          const tradingMode = data?.data?.marketTradingMode;
          const state = data?.data?.marketState;
          const tooltip = getMarketStateTooltip(state, tradingMode);
          const productType =
            data?.tradableInstrument.instrument.product.__typename;
          return (
            <Tooltip description={t(tooltip)}>
              <span className="flex items-center gap-2 cursor-pointer">
                <span className="mr-1">
                  <EmblemByMarket market={data?.id || ''} vegaChain={chainId} />
                </span>
                <StackedCell
                  primary={
                    <span className="flex gap-1">
                      {value}
                      <MarketProductPill productType={productType} />
                      <MarketIcon data={data} />
                    </span>
                  }
                  secondary={data?.tradableInstrument.instrument.name}
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
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (data && isSpot(data.tradableInstrument.instrument.product)) {
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
        }: VegaValueFormatterParams<Market, 'data.markPrice'>) => {
          return priceValueFormatter(data);
        },
      },
      {
        headerName: '24h Change',
        field: 'candlesConnection',
        type: 'rightAligned',
        cellRenderer: ({ data }: { data: Market }) => {
          if (!data) return;
          const candles = data.candlesConnection?.edges
            ?.map((e) => e!.node)
            ?.filter((c) => c.close)
            .map((c) => Number(c.close));

          return (
            <div className="flex flex-row gap-2 justify-end">
              <span>
                <Last24hPriceChange
                  marketId={data.id}
                  decimalPlaces={data.decimalPlaces}
                  orientation="vertical"
                  showChangeValue={true}
                  fallback={
                    <span className="leading-4">
                      <div className="text-ellipsis whitespace-nowrap overflow-hidden">
                        <span data-testid="price-change-percentage">
                          {'0.00%'}
                        </span>
                      </div>
                      <span
                        data-testid="price-change"
                        className="text-ellipsis whitespace-nowrap overflow-hidden text-muted"
                      >
                        ({'0.00'})
                      </span>
                    </span>
                  }
                />
              </span>
              <span>
                <Sparkline width={80} height={20} data={candles || [0]} />
              </span>
            </div>
          );
        },
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (!data?.candlesConnection?.edges?.length) return 0;
          const candles = data.candlesConnection.edges.map(
            (c) => c!.node.close
          );
          const change = priceChangePercentage(candles);
          if (!change) return 0;
          return change;
        },
      },
      {
        headerName: t('24h Volume'),
        type: 'rightAligned',
        field: 'candlesConnection',
        sort: 'desc',
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (!data) return 0;
          const candles = data?.candlesConnection?.edges?.length
            ? data.candlesConnection.edges.map((e) => e!.node)
            : [];
          const volPrice =
            candles &&
            calcCandleVolumePrice(
              candles,
              data.decimalPlaces,
              data.positionDecimalPlaces
            );
          if (!volPrice) return 0;
          return Number(volPrice);
        },
        cellRenderer: ({ data }: ValueFormatterParams<Market>) => {
          if (!data) return '-';
          const candles = data?.candlesConnection?.edges?.length
            ? data.candlesConnection.edges.map((e) => e!.node)
            : [];
          const vol = candles ? calcCandleVolume(candles) : '0';
          const quoteName = getQuoteName(data);
          const volPrice = candles
            ? calcCandleVolumePrice(
                candles,
                data.decimalPlaces,
                data.positionDecimalPlaces
              )
            : '0';

          const volume =
            data && vol && vol !== '0'
              ? addDecimalsFormatNumber(vol, data.positionDecimalPlaces, 2)
              : '0.00';
          const volumePrice = volPrice && formatNumber(volPrice, 0);

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
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          const openInterestData = data && openInterestValues(data);
          if (!openInterestData) return 0;
          const { openInterestNotional } = openInterestData;
          return openInterestNotional.toNumber();
        },
        cellRenderer: ({
          data,
        }: VegaValueFormatterParams<Market, 'data.openInterest'>) => {
          return (
            <span className="font-mono">
              <OpenInterestCell data={data} />
            </span>
          );
        },
      },
    ],
    [chainId, t]
  );
};
