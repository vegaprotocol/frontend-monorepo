import { useMemo } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS, StackedCell } from '@vegaprotocol/datagrid';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import type {
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';
import { MarketActionsDropdown } from './market-table-actions';
import {
  Last24hPriceChange,
  calcCandleVolume,
  calcCandleVolumePrice,
  getAsset,
  getQuoteAsset,
  getQuoteName,
} from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';

export const priceChangeRenderer = (
  data: MarketMaybeWithDataAndCandles | undefined
) => {
  if (!data) return null;
  const candles =
    data.candles?.filter((c) => c.close).map((c) => Number(c.close)) || [];
  return (
    <div className="flex flex-row gap-2">
      <Last24hPriceChange
        marketId={data.id}
        decimalPlaces={data.decimalPlaces}
        orientation="vertical"
        fallback={<span />} // don't render anything so price is vertically centered
      />
      <Sparkline width={80} height={20} data={candles} />
    </div>
  );
};

export const priceValueFormatter = (
  data: MarketMaybeWithData | undefined
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
    : `${addDecimalsFormatNumber(
        data.data.markPrice,
        data.decimalPlaces
      )} ${quoteName}`;
};

export const useMarketsColumnDefs = () => {
  const t = useT();

  return useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Market'),
        field: 'tradableInstrument.instrument.code',
        pinned: true,
        minWidth: 200,
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<
          MarketMaybeWithData,
          'tradableInstrument.instrument.code'
        >) => (
          <StackedCell
            primary={value}
            secondary={data?.tradableInstrument.instrument.name}
          />
        ),
      },
      {
        headerName: t('Price'),
        field: 'data.markPrice',
        type: 'rightAligned',
        cellRenderer: 'PriceFlashCell',
        filter: 'agNumberColumnFilter',
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
          return priceChangeRenderer(data);
        },
      },
      {
        headerName: t('24h volume'),
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
              ? addDecimalsFormatNumber(vol, data.positionDecimalPlaces)
              : '0.00';
          const volumePrice =
            volPrice && formatNumber(volPrice, data?.decimalPlaces);

          return volumePrice ? (
            <StackedCell
              primary={volume}
              secondary={`${volumePrice} ${quoteName}`}
            />
          ) : (
            <StackedCell primary={volume} secondary={''} />
          );
        },
      },
      {
        headerName: t('Open Interest'),
        field: 'data.openInterest',
        type: 'rightAligned',
        cellRenderer: ({
          data,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.openInterest'
        >) => {
          const openInterest =
            data?.data?.openInterest === undefined
              ? '-'
              : addDecimalsFormatNumber(
                  data?.data?.openInterest,
                  data?.positionDecimalPlaces
                );
          // TODO: calculate USDT value
          // const markPrice = data?.data?.markPrice;
          const openInterestValue = openInterest;
          return (
            <StackedCell primary={openInterest} secondary={openInterestValue} />
          );
        },
      },
      {
        colId: 'market-actions',
        field: 'id',
        ...COL_DEFS.actions,
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<MarketMaybeWithData>) => {
          if (!data) return null;
          return (
            <MarketActionsDropdown
              marketId={data.id}
              assetId={getAsset(data).id}
              successorMarketID={data.successorMarketID}
              parentMarketID={data.parentMarketID}
            />
          );
        },
      },
    ],
    [t]
  );
};
