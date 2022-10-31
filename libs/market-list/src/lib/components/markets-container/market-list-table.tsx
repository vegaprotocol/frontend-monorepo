import { forwardRef } from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import type {
  VegaValueGetterParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type {
  AgGridReact,
  AgGridReactProps,
  AgReactUiProps,
} from 'ag-grid-react';
import {
  MarketTradingMode,
  AuctionTrigger,
  MarketTradingModeMapping,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';
import type { MarketWithData } from '../../';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

type Props = AgGridReactProps | AgReactUiProps;

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

export const MarketListTable = forwardRef<AgGridReact, Props>((props, ref) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No markets')}
      getRowId={getRowId}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
        filterParams: { buttons: ['reset'] },
      }}
      suppressCellFocus={true}
      components={{ PriceFlashCell }}
      {...props}
    >
      <AgGridColumn
        headerName={t('Market')}
        field="tradableInstrument.instrument.code"
      />
      <AgGridColumn
        headerName={t('Settlement asset')}
        field="tradableInstrument.instrument.product.settlementAsset.symbol"
        cellRenderer={({ value }: ICellRendererParams) =>
          value && value.length > 0 ? (
            <button
              className="hover:underline"
              onClick={(e) => {
                openAssetDetailsDialog(value, e.target as HTMLElement);
              }}
            >
              {value}
            </button>
          ) : (
            ''
          )
        }
      />
      <AgGridColumn
        headerName={t('Trading mode')}
        field="data"
        minWidth={170}
        valueGetter={({
          data,
        }: VegaValueGetterParams<MarketWithData, 'data'>) => {
          if (!data?.data) return undefined;
          const { trigger } = data.data;
          const { tradingMode } = data;
          return tradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
            trigger &&
            trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
            ? `${MarketTradingModeMapping[tradingMode]}
            - ${AuctionTriggerMapping[trigger]}`
            : MarketTradingModeMapping[tradingMode];
        }}
      />
      <AgGridColumn
        headerName={t('Best bid')}
        field="data.bestBidPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        filter="agNumberColumnFilter"
        valueGetter={({
          data,
        }: VegaValueGetterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['bestBidPrice']
        >) => {
          return data?.data?.bestBidPrice === undefined
            ? undefined
            : toBigNum(data?.data?.bestBidPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['bestBidPrice']
        >) =>
          data?.data?.bestBidPrice === undefined
            ? undefined
            : addDecimalsFormatNumber(
                data.data.bestBidPrice,
                data.decimalPlaces
              )
        }
      />
      <AgGridColumn
        headerName={t('Best offer')}
        field="data.bestOfferPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        filter="agNumberColumnFilter"
        valueGetter={({
          data,
        }: VegaValueGetterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['bestOfferPrice']
        >) => {
          return data?.data?.bestOfferPrice === undefined
            ? undefined
            : toBigNum(
                data?.data?.bestOfferPrice,
                data.decimalPlaces
              ).toNumber();
        }}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['bestOfferPrice']
        >) =>
          data?.data?.bestOfferPrice === undefined
            ? undefined
            : addDecimalsFormatNumber(
                data.data.bestOfferPrice,
                data.decimalPlaces
              )
        }
      />
      <AgGridColumn
        headerName={t('Mark price')}
        field="data.markPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        filter="agNumberColumnFilter"
        valueGetter={({
          data,
        }: VegaValueGetterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['markPrice']
        >) => {
          return data?.data?.markPrice === undefined
            ? undefined
            : toBigNum(data?.data?.markPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<
          MarketWithData,
          NonNullable<MarketWithData['data']>['markPrice']
        >) =>
          data?.data?.bestOfferPrice === undefined
            ? undefined
            : addDecimalsFormatNumber(data.data.markPrice, data.decimalPlaces)
        }
      />
      <AgGridColumn headerName={t('Description')} field="name" />
    </AgGrid>
  );
});

export default MarketListTable;
