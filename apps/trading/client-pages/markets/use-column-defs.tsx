import { useMemo } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS, SetFilter } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import { ButtonLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type {
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';
import { MarketActionsDropdown } from './market-table-actions';
import {
  calcCandleVolume,
  calcCandleVolumePrice,
  getAsset,
  getQuoteName,
  isSpot,
} from '@vegaprotocol/markets';
import { MarketCodeCell } from './market-code-cell';
import { useT } from '../../lib/use-t';

const { MarketTradingMode, AuctionTrigger } = Schema;

export const useMarketsColumnDefs = () => {
  const t = useT();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  return useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Market'),
        field: 'tradableInstrument.instrument.code',
        pinned: true,
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<
          MarketMaybeWithData,
          'tradableInstrument.instrument.code'
        >) => (
          <MarketCodeCell
            value={value}
            data={{
              productType:
                data?.tradableInstrument.instrument.product.__typename,
              successorMarketID: data?.successorMarketID,
              parentMarketID: data?.parentMarketID,
            }}
          />
        ),
      },
      {
        headerName: t('Description'),
        field: 'tradableInstrument.instrument.name',
      },
      {
        headerName: t('Settlement asset'),
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<
          MarketMaybeWithData,
          'tradableInstrument.instrument.product.settlementAsset.symbol'
        >) => {
          const value = data && getAsset(data);
          return value ? (
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(value.id, e.target as HTMLElement);
              }}
            >
              {value.symbol}
            </ButtonLink>
          ) : (
            ''
          );
        },
      },
      {
        headerName: t('Trading mode'),
        field: 'tradingMode',
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<MarketMaybeWithData, 'data'>) => {
          if (!data?.data) return '-';
          const { trigger, marketTradingMode } = data.data;

          const withTriggerInfo =
            marketTradingMode ===
              MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
            trigger &&
            trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED;

          if (withTriggerInfo) {
            return (
              <Tooltip
                description={`${Schema.MarketTradingModeMapping[marketTradingMode]}
                - ${Schema.AuctionTriggerMapping[trigger]}`}
              >
                <span>
                  {Schema.MarketTradingModeMapping[marketTradingMode]}
                </span>
              </Tooltip>
            );
          }

          return Schema.MarketTradingModeMapping[marketTradingMode];
        },
        filter: SetFilter,
        filterParams: {
          set: Schema.MarketTradingModeMapping,
        },
      },
      {
        headerName: t('Status'),
        field: 'state',
        valueFormatter: ({
          data,
        }: VegaValueFormatterParams<MarketMaybeWithData, 'state'>) => {
          return data?.data?.marketState
            ? Schema.MarketStateMapping[data?.data?.marketState]
            : '-';
        },
        filter: SetFilter,
        filterParams: {
          set: Schema.MarketStateMapping,
        },
      },
      {
        headerName: t('Price'),
        field: 'data.markPrice',
        type: 'rightAligned',
        cellRenderer: 'PriceFlashCell',
        filter: 'agNumberColumnFilter',
        valueGetter: ({ data }: VegaValueGetterParams<MarketMaybeWithData>) => {
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
        }: VegaValueFormatterParams<MarketMaybeWithData, 'data.markPrice'>) => {
          if (data && isSpot(data.tradableInstrument.instrument.product)) {
            return data?.data?.lastTradedPrice === undefined
              ? '-'
              : addDecimalsFormatNumber(
                  data.data.lastTradedPrice,
                  data.decimalPlaces
                );
          }
          return data?.data?.bestOfferPrice === undefined
            ? '-'
            : addDecimalsFormatNumber(data.data.markPrice, data.decimalPlaces);
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
        valueFormatter: ({
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

          return volumePrice
            ? `${volume} (${volumePrice} ${quoteName})`
            : volume;
        },
      },
      {
        headerName: t('Open Interest'),
        field: 'data.openInterest',
        type: 'rightAligned',
        valueFormatter: ({
          data,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.openInterest'
        >) =>
          data?.data?.openInterest === undefined
            ? '-'
            : addDecimalsFormatNumber(
                data?.data?.openInterest,
                data?.positionDecimalPlaces
              ),
      },
      {
        headerName: t('Spread'),
        field: 'data.bestBidPrice',
        type: 'rightAligned',
        filter: 'agNumberColumnFilter',
        cellRenderer: 'PriceFlashCell',
        valueGetter: ({ data }: VegaValueGetterParams<MarketMaybeWithData>) => {
          if (!data || !data.data?.bestOfferPrice || !data.data?.bestBidPrice) {
            return undefined;
          }

          const offer = toBigNum(data.data.bestOfferPrice, data.decimalPlaces);
          const bid = toBigNum(data.data.bestBidPrice, data.decimalPlaces);

          const spread = offer.minus(bid).toNumber();

          // The calculation above can result in '-0' being rendered after formatting
          // so return Math.abs to remove it and just render '0'
          if (spread === 0) {
            return Math.abs(spread);
          }

          return spread;
        },
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.bestBidPrice'
        >) => {
          if (!value) return '-';
          return value.toString();
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
    [openAssetDetailsDialog, t]
  );
};
