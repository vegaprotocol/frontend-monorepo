import { useMemo } from 'react';
import compact from 'lodash/compact';
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
import { type Market } from '@vegaprotocol/data-provider';
import {
  Last24hPriceChange,
  calcCandleVolume,
  calcCandleVolumePrice,
  getQuoteAsset,
  getQuoteName,
  isSpot,
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

export const PriceChange = ({
  market,
  showChangeValue = true,
}: {
  market: Market | undefined;
  showChangeValue?: boolean;
}) => {
  if (!market) return null;
  return (
    <Last24hPriceChange
      marketId={market.id}
      decimalPlaces={market.decimalPlaces}
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
              className="text-ellipsis whitespace-nowrap overflow-hidden text-muted text-xs"
            >
              ({'0.00'})
            </span>
          )}
        </span>
      }
    />
  );
};

export const PriceChangeSparkline = (props: { market: Market | undefined }) => {
  const edges = props.market?.candlesConnection?.edges;

  if (!edges?.length) return null;

  const candles = edges
    .filter((c) => c?.node.close)
    .map((c) => Number(c?.node.close));
  if (!candles?.length) return null;
  return <Sparkline width={80} height={20} data={candles || [0]} />;
};

export const priceValueFormatter = (
  data: Market | undefined,
  formatDecimalPlaces?: number
): string => {
  if (!data) return '-';

  const product = data.tradableInstrument.instrument.product;
  const quoteName = getQuoteName(data);

  if (isSpot(product)) {
    const quoteAsset = data && getQuoteAsset(data);
    return data?.data?.lastTradedPrice === undefined
      ? '-'
      : `${addDecimalsFormatNumber(
          data.data.lastTradedPrice,
          data.decimalPlaces
        )} ${quoteAsset?.symbol}`;
  }

  return data?.data?.bestOfferPrice === undefined
    ? '-'
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
        cellClass: 'text-base',
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
            data?.tradableInstrument?.instrument.product.__typename;
          return (
            <Tooltip description={t(tooltip)}>
              <span className="flex items-center gap-2 cursor-pointer">
                <EmblemByMarket market={data?.id || ''} vegaChain={chainId} />
                <StackedCell
                  primary={
                    <span className="flex gap-1 items-center">
                      {value}
                      <MarketProductPill productType={productType} />
                      <MarketIcon data={data} />
                    </span>
                  }
                  secondary={data?.tradableInstrument?.instrument.name}
                />
              </span>
            </Tooltip>
          );
        },
      },
      {
        headerName: t('Price'),
        field: 'data.markPrice',
        cellRenderer: 'PriceFlashCell',
        filter: 'agNumberColumnFilter',
        maxWidth: 150,
        cellClass: 'text-sm text-right font-mono',
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (!data) return;

          const product = data.tradableInstrument.instrument.product;

          if (isSpot(product)) {
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
        id: 'candlesConnection.edges',
        type: 'rightAligned',
        cellClass: 'text-sm text-right font-mono',
        cellRenderer: ({
          data,
        }: ValueFormatterParams<Market, 'candlesConnection.edges'>) => {
          return (
            <div className="flex gap-2 justify-end">
              <span>
                <PriceChangeSparkline market={data} />
              </span>
              <span>
                <PriceChange market={data} />
              </span>
            </div>
          );
        },
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (!data?.candlesConnection?.edges?.length) return 0;
          const candles = compact(
            data.candlesConnection.edges.map((c) => c?.node.close)
          );
          const change = priceChangePercentage(candles);
          if (!change) return 0;
          return change;
        },
      },
      {
        headerName: t('24h Volume'),
        type: 'rightAligned',
        field: 'data.candles',
        sort: 'desc',
        cellClass: 'text-sm text-right',
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          if (!data) return 0;
          const candles = compact(
            data?.candlesConnection?.edges?.map((e) => e?.node)
          );
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
        cellRenderer: ({ value, data }: { value: number; data: Market }) => {
          if (!data) return '-';
          const candles = compact(
            data.candlesConnection?.edges?.map((e) => e?.node)
          );
          const vol = candles ? calcCandleVolume(candles) : '0';
          const quoteName = getQuoteName(data);

          const volume =
            data && vol && vol !== '0'
              ? addDecimalsFormatNumber(vol, data.positionDecimalPlaces, 2)
              : '0.00';
          const volumePrice = value && formatNumber(value, 0);

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
        cellClass: 'text-sm text-right',
        valueGetter: ({ data }: VegaValueGetterParams<Market>) => {
          const openInterestData = data && openInterestValues(data);
          if (!openInterestData) return 0;
          const { openInterestNotional } = openInterestData;
          return openInterestNotional.toNumber();
        },
        cellRenderer: ({
          data,
        }: VegaValueFormatterParams<Market, 'data.openInterest'>) => {
          if (!data || !openInterestValues(data)) {
            return <span>-</span>;
          }
          return (
            <span className="font-mono">
              <OpenInterestCell data={data} />
            </span>
          );
        },
      },
    ],
    [t, chainId]
  );
};
