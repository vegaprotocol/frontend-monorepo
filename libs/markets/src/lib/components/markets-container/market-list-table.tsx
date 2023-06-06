import { forwardRef } from 'react';
import { addDecimalsFormatNumber, toBigNum } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type {
  VegaValueGetterParams,
  VegaValueFormatterParams,
  VegaICellRendererParams,
  TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import { COL_DEFS } from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  PriceFlashCell,
  MarketNameCell,
  SetFilter,
} from '@vegaprotocol/datagrid';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import * as Schema from '@vegaprotocol/types';
import type { MarketMaybeWithData } from '../../markets-provider';
import { MarketTableActions } from './market-table-actions';
import { OracleStatus } from './oracle-status';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

const { MarketTradingMode, AuctionTrigger } = Schema;

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

interface MarketNameCellProps {
  value?: string;
  data?: MarketMaybeWithData;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}

const MarketName = (props: MarketNameCellProps) => (
  <>
    <MarketNameCell {...props} />
    {props.data ? (
      <OracleStatus
        dataSourceSpecForSettlementData={
          props.data.tradableInstrument.instrument.product
            .dataSourceSpecForSettlementData
        }
        dataSourceSpecForTradingTermination={
          props.data.tradableInstrument.instrument.product
            .dataSourceSpecForTradingTermination
        }
      />
    ) : null}
  </>
);

export const MarketListTable = forwardRef<
  AgGridReact,
  TypedDataAgGrid<MarketMaybeWithData> & {
    onMarketClick: (marketId: string, metaKey?: boolean) => void;
  }
>(({ onMarketClick, ...props }, ref) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      getRowId={getRowId}
      ref={ref}
      defaultColDef={{
        resizable: true,
        sortable: true,
        filter: true,
        filterParams: { buttons: ['reset'] },
        minWidth: 100,
      }}
      suppressCellFocus
      components={{ PriceFlashCell, MarketName }}
      storeKey="allMarkets"
      {...props}
    >
      <AgGridColumn
        headerName={t('Market')}
        field="tradableInstrument.instrument.code"
        cellRenderer="MarketName"
        cellRendererParams={{ onMarketClick }}
      />
      <AgGridColumn
        headerName={t('Description')}
        field="tradableInstrument.instrument.name"
      />
      <AgGridColumn
        headerName={t('Trading mode')}
        field="tradingMode"
        minWidth={170}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<MarketMaybeWithData, 'data'>) => {
          if (!data?.data) return undefined;
          const { trigger, marketTradingMode } = data.data;
          return marketTradingMode ===
            MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
            trigger &&
            trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
            ? `${Schema.MarketTradingModeMapping[marketTradingMode]}
            - ${Schema.AuctionTriggerMapping[trigger]}`
            : Schema.MarketTradingModeMapping[marketTradingMode];
        }}
        filter={SetFilter}
        filterParams={{
          set: Schema.MarketTradingModeMapping,
        }}
      />
      <AgGridColumn
        headerName={t('Status')}
        field="state"
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<MarketMaybeWithData, 'state'>) => {
          return data?.state ? Schema.MarketStateMapping[data.state] : '-';
        }}
        filter={SetFilter}
        filterParams={{
          set: Schema.MarketStateMapping,
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
        }: VegaValueGetterParams<MarketMaybeWithData, 'data.bestBidPrice'>) => {
          return data?.data?.bestBidPrice === undefined
            ? undefined
            : toBigNum(data?.data?.bestBidPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<
          MarketMaybeWithData,
          'data.bestBidPrice'
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
          MarketMaybeWithData,
          'data.bestOfferPrice'
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
          MarketMaybeWithData,
          'data.bestOfferPrice'
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
        }: VegaValueGetterParams<MarketMaybeWithData, 'data.markPrice'>) => {
          return data?.data?.markPrice === undefined
            ? undefined
            : toBigNum(data?.data?.markPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<MarketMaybeWithData, 'data.markPrice'>) =>
          data?.data?.bestOfferPrice === undefined
            ? undefined
            : addDecimalsFormatNumber(data.data.markPrice, data.decimalPlaces)
        }
      />
      <AgGridColumn
        headerName={t('Settlement asset')}
        field="tradableInstrument.instrument.product.settlementAsset.symbol"
        cellRenderer={({
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
        }}
      />
      <AgGridColumn
        colId="market-actions"
        field="id"
        {...COL_DEFS.actions}
        cellRenderer={({
          data,
        }: VegaICellRendererParams<MarketMaybeWithData>) => {
          if (!data) return null;
          return (
            <MarketTableActions
              marketId={data.id}
              assetId={
                data.tradableInstrument.instrument.product.settlementAsset.id
              }
            />
          );
        }}
      />
    </AgGrid>
  );
});

export default MarketListTable;
