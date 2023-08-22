import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import compact from 'lodash/compact';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS, SetFilter } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber, toBigNum } from '@vegaprotocol/utils';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { FLAGS } from '@vegaprotocol/environment';
import type { MarketMaybeWithData } from '../../markets-provider';
import { MarketActionsDropdown } from './market-table-actions';

interface Props {
  onMarketClick: (marketId: string, metaKey?: boolean) => void;
}

const { MarketTradingMode, AuctionTrigger } = Schema;

export const useColumnDefs = ({ onMarketClick }: Props) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  return useMemo<ColDef[]>(
    () =>
      compact([
        {
          headerName: t('Market'),
          field: 'tradableInstrument.instrument.code',
          cellRenderer: 'MarketName',
          cellRendererParams: { onMarketClick },
        },
        {
          headerName: t('Description'),
          field: 'tradableInstrument.instrument.name',
        },
        {
          headerName: t('Trading mode'),
          field: 'tradingMode',
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<MarketMaybeWithData, 'data'>) => {
            if (!data?.data) return '-';
            const { trigger, marketTradingMode } = data.data;
            return marketTradingMode ===
              MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
              trigger &&
              trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
              ? `${Schema.MarketTradingModeMapping[marketTradingMode]}
            - ${Schema.AuctionTriggerMapping[trigger]}`
              : Schema.MarketTradingModeMapping[marketTradingMode];
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
            return data?.state ? Schema.MarketStateMapping[data.state] : '-';
          },
          filter: SetFilter,
          filterParams: {
            set: Schema.MarketStateMapping,
          },
        },
        FLAGS.SUCCESSOR_MARKETS && {
          headerName: t('Successor market'),
          field: 'successorMarketID',
          cellRenderer: 'SuccessorMarketRenderer',
        },
        {
          headerName: t('Best bid'),
          field: 'data.bestBidPrice',
          type: 'rightAligned',
          cellRenderer: 'PriceFlashCell',
          filter: 'agNumberColumnFilter',
          valueGetter: ({
            data,
          }: VegaValueGetterParams<MarketMaybeWithData>) => {
            return data?.data?.bestBidPrice === undefined
              ? undefined
              : toBigNum(
                  data?.data?.bestBidPrice,
                  data.decimalPlaces
                ).toNumber();
          },
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<
            MarketMaybeWithData,
            'data.bestBidPrice'
          >) =>
            data?.data?.bestBidPrice === undefined
              ? '-'
              : addDecimalsFormatNumber(
                  data.data.bestBidPrice,
                  data.decimalPlaces
                ),
        },
        {
          headerName: t('Best offer'),
          field: 'data.bestOfferPrice',
          type: 'rightAligned',
          cellRenderer: 'PriceFlashCell',
          filter: 'agNumberColumnFilter',
          valueGetter: ({
            data,
          }: VegaValueGetterParams<MarketMaybeWithData>) => {
            return data?.data?.bestOfferPrice === undefined
              ? undefined
              : toBigNum(
                  data?.data?.bestOfferPrice,
                  data.decimalPlaces
                ).toNumber();
          },
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<
            MarketMaybeWithData,
            'data.bestOfferPrice'
          >) =>
            data?.data?.bestOfferPrice === undefined
              ? '-'
              : addDecimalsFormatNumber(
                  data.data.bestOfferPrice,
                  data.decimalPlaces
                ),
        },
        {
          headerName: t('Mark price'),
          field: 'data.markPrice',
          type: 'rightAligned',
          cellRenderer: 'PriceFlashCell',
          filter: 'agNumberColumnFilter',
          valueGetter: ({
            data,
          }: VegaValueGetterParams<MarketMaybeWithData>) => {
            return data?.data?.markPrice === undefined
              ? undefined
              : toBigNum(data?.data?.markPrice, data.decimalPlaces).toNumber();
          },
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<MarketMaybeWithData, 'data.markPrice'>) =>
            data?.data?.bestOfferPrice === undefined
              ? '-'
              : addDecimalsFormatNumber(
                  data.data.markPrice,
                  data.decimalPlaces
                ),
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
            const value =
              data &&
              'settlementAsset' in data.tradableInstrument.instrument.product
                ? data?.tradableInstrument.instrument.product.settlementAsset
                : undefined;

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
                assetId={
                  'settlementAsset' in
                  data.tradableInstrument.instrument.product
                    ? data.tradableInstrument.instrument.product.settlementAsset
                        .id
                    : ''
                }
              />
            );
          },
        },
      ]),
    [onMarketClick, openAssetDetailsDialog]
  );
};
