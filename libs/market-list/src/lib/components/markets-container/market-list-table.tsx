import { forwardRef } from 'react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type {
  AgGridReact,
  AgGridReactProps,
  AgReactUiProps,
} from 'ag-grid-react';
import {
  Schema,
  MarketTradingModeMapping,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';
import type { MarketListItemFragment } from '../../';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

type Props = AgGridReactProps | AgReactUiProps;

type MarketListTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: MarketListItemFragment;
};

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

export const MarketListTable = forwardRef<AgGridReact, Props>((props, ref) => {
  const { setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol } =
    useAssetDetailsDialogStore();
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
        cellRenderer={({ value }: GroupCellRendererParams) =>
          value && value.length > 0 ? (
            <button
              className="hover:underline"
              onClick={() => {
                setAssetDetailsDialogOpen(true);
                setAssetDetailsDialogSymbol(value);
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
        valueGetter={({ data }: { data?: MarketListItemFragment }) => {
          if (!data?.data) return undefined;
          const { market, trigger } = data.data;
          return market &&
            market.tradingMode ===
              Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
            trigger &&
            trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
            ? `${MarketTradingModeMapping[market.tradingMode]}
            - ${AuctionTriggerMapping[trigger]}`
            : MarketTradingModeMapping[market.tradingMode];
        }}
      />
      <AgGridColumn
        headerName={t('Best bid')}
        field="data.bestBidPrice"
        type="rightAligned"
        cellRenderer="PriceFlashCell"
        filter="agNumberColumnFilter"
        valueGetter={({ data }: { data?: MarketListItemFragment }) => {
          return data?.data?.bestBidPrice === undefined
            ? undefined
            : toBigNum(data?.data?.bestBidPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({ data }: MarketListTableValueFormatterParams) =>
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
        valueGetter={({ data }: { data?: MarketListItemFragment }) => {
          return data?.data?.bestOfferPrice === undefined
            ? undefined
            : toBigNum(
                data?.data?.bestOfferPrice,
                data.decimalPlaces
              ).toNumber();
        }}
        valueFormatter={({ data }: MarketListTableValueFormatterParams) =>
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
        valueGetter={({ data }: { data?: MarketListItemFragment }) => {
          return data?.data?.markPrice === undefined
            ? undefined
            : toBigNum(data?.data?.markPrice, data.decimalPlaces).toNumber();
        }}
        valueFormatter={({ data }: MarketListTableValueFormatterParams) =>
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
