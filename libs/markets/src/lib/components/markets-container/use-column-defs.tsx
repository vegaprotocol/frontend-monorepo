import { useMemo } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import compact from 'lodash/compact';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS, FlashCell, SetFilter } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber, toBigNum } from '@vegaprotocol/utils';
import { ButtonLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type {
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from '../../markets-provider';
import { MarketActionsDropdown } from './market-table-actions';
import { calcCandleVolume } from '../../market-utils';

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
          flex: 2,
        },
        {
          headerName: t('Description'),
          field: 'tradableInstrument.instrument.name',
          flex: 2,
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
            return data?.state ? Schema.MarketStateMapping[data.state] : '-';
          },
          filter: SetFilter,
          filterParams: {
            set: Schema.MarketStateMapping,
          },
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
          }: ValueFormatterParams<
            MarketMaybeWithDataAndCandles,
            'candles'
          >) => {
            const candles = data?.candles;
            const vol = candles ? calcCandleVolume(candles) : '0';
            const volume =
              data && vol && vol !== '0'
                ? addDecimalsFormatNumber(vol, data.positionDecimalPlaces)
                : '0.00';
            return volume;
          },
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
              data?.tradableInstrument.instrument.product.settlementAsset;
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
          headerName: t('Spread'),
          field: 'data.bestBidPrice',
          type: 'rightAligned',
          filter: 'agNumberColumnFilter',
          valueGetter: ({
            data,
          }: VegaValueGetterParams<MarketMaybeWithData>) => {
            const offer =
              data?.data?.bestOfferPrice === undefined
                ? undefined
                : toBigNum(
                    data?.data?.bestOfferPrice,
                    data.decimalPlaces
                  ).toNumber();
            const bid =
              data?.data?.bestBidPrice === undefined
                ? undefined
                : toBigNum(
                    data?.data?.bestBidPrice,
                    data.decimalPlaces
                  ).toNumber();
            return Number(bid) - Number(offer);
          },
          cellRenderer: ({
            data,
          }: VegaICellRendererParams<MarketMaybeWithData, 'data'>) => {
            const offerValue =
              data?.data?.bestOfferPrice === undefined
                ? undefined
                : toBigNum(
                    data?.data?.bestOfferPrice,
                    data.decimalPlaces
                  ).toNumber();
            const bidValue =
              data?.data?.bestBidPrice === undefined
                ? undefined
                : toBigNum(
                    data?.data?.bestBidPrice,
                    data.decimalPlaces
                  ).toNumber();

            const offerFlash = (
              <span className="font-mono" data-testid="offer-price">
                <FlashCell value={Number(offerValue)}>
                  {data?.data?.bestOfferPrice === undefined
                    ? '-'
                    : addDecimalsFormatNumber(
                        data.data.bestOfferPrice,
                        data.decimalPlaces
                      )}
                </FlashCell>
              </span>
            );
            const bidFlash = (
              <span className="font-mono" data-testid="bid-price">
                <FlashCell value={Number(bidValue)}>
                  {data?.data?.bestBidPrice === undefined
                    ? '-'
                    : addDecimalsFormatNumber(
                        data.data.bestBidPrice,
                        data.decimalPlaces
                      )}
                </FlashCell>
              </span>
            );
            return (
              <>
                {offerFlash} - {bidFlash}
              </>
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
                  data.tradableInstrument.instrument.product.settlementAsset.id
                }
              />
            );
          },
        },
      ]),
    [onMarketClick, openAssetDetailsDialog]
  );
};
