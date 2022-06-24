import type { AgGridReact } from 'ag-grid-react';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { forwardRef } from 'react';
import type { FillFields } from './__generated__/FillFields';
import type { ValueFormatterParams } from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import { Side } from '@vegaprotocol/types';

export interface FillsTableProps {
  partyId: string;
  fills: FillFields[];
}

export const FillsTable = forwardRef<AgGridReact, FillsTableProps>(
  ({ partyId, fills }, ref) => {
    return (
      <AgGrid
        ref={ref}
        rowData={fills}
        overlayNoRowsTemplate="No fills"
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        getRowId={({ data }) => data.id}
      >
        <AgGridColumn headerName="Market" field="market.name" />
        <AgGridColumn
          headerName="Amount"
          field="size"
          cellClass={({ data }: { data: FillFields }) => {
            console.log(data);
            let className = '';
            if (data.buyer.id === partyId) {
              className = 'text-vega-green';
            } else if (data.seller.id) {
              className = 'text-vega-red';
            }
            return className;
          }}
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            let prefix;
            if (data.buyer.id === partyId) {
              prefix = '+';
            } else if (data.seller.id) {
              prefix = '-';
            }

            const size = addDecimalsFormatNumber(
              value,
              data.market.positionDecimalPlaces
            );
            return `${prefix}${size}`;
          }}
        />
        <AgGridColumn
          headerName="Value"
          field="price"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const asset =
              data.market.tradableInstrument.instrument.product.settlementAsset
                .symbol;
            const valueFormatted = addDecimalsFormatNumber(
              value,
              data.market.decimalPlaces
            );
            return `${valueFormatted} ${asset}`;
          }}
        />
        <AgGridColumn
          headerName="Filled value"
          valueFormatter={({ data }: ValueFormatterParams) => {
            const asset =
              data.market.tradableInstrument.instrument.product.settlementAsset
                .symbol;
            const size = new BigNumber(
              addDecimal(data.size, data.market.positionDecimalPlaces)
            );
            const price = new BigNumber(
              addDecimal(data.price, data.market.decimalPlaces)
            );

            const value = size.times(price).toString();
            const valueFormatted = formatNumber(
              value,
              data.market.decimalPlaces
            );
            return `${valueFormatted} ${asset}`;
          }}
        />
        <AgGridColumn
          headerName="Role"
          valueFormatter={({ data }: { data: FillFields }) => {
            if (data.buyer.id === partyId) {
              if (data.aggressor === Side.Buy) {
                return 'Taker';
              } else {
                return 'Maker';
              }
            } else if (data.seller.id === partyId) {
              if (data.aggressor === Side.Sell) {
                return 'Taker';
              } else {
                return 'Maker';
              }
            } else {
              return '-';
            }
          }}
        />
        <AgGridColumn
          headerName="Fee"
          valueFormatter={({ data }: ValueFormatterParams) => {
            const asset =
              data.market.tradableInstrument.instrument.product.settlementAsset;
            let feesObj;
            if (data.buyer.id === partyId) {
              feesObj = data.buyerFee;
            } else if (data.seller.id === partyId) {
              feesObj = data.sellerFee;
            } else {
              return '-';
            }

            const fee = new BigNumber(feesObj.makerFee)
              .plus(feesObj.infrastructureFee)
              .plus(feesObj.liquidityFee);
            const value = addDecimalsFormatNumber(
              fee.toString(),
              asset.decimals
            );
            return `${value} ${asset.symbol}`;
          }}
        />
        <AgGridColumn
          headerName="Date"
          field="createdAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);
