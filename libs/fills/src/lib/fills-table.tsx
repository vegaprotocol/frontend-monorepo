import type { AgGridReact } from 'ag-grid-react';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  t,
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
        <AgGridColumn headerName={t('Market')} field="market.name" />
        <AgGridColumn
          headerName={t('Amount')}
          field="size"
          cellClass={({ data }: { data: FillFields }) => {
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
          headerName={t('Value')}
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
          headerName={t('Filled value')}
          field="price"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const asset =
              data.market.tradableInstrument.instrument.product.settlementAsset
                .symbol;
            const size = new BigNumber(
              addDecimal(data.size, data.market.positionDecimalPlaces)
            );
            const price = new BigNumber(
              addDecimal(value, data.market.decimalPlaces)
            );

            const total = size.times(price).toString();
            const valueFormatted = formatNumber(
              total,
              data.market.decimalPlaces
            );
            return `${valueFormatted} ${asset}`;
          }}
        />
        <AgGridColumn
          headerName={t('Role')}
          field="aggressor"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const taker = t('Taker');
            const maker = t('Maker');
            if (data.buyer.id === partyId) {
              if (value === Side.Buy) {
                return taker;
              } else {
                return maker;
              }
            } else if (data.seller.id === partyId) {
              if (value === Side.Sell) {
                return taker;
              } else {
                return maker;
              }
            } else {
              return '-';
            }
          }}
        />
        <AgGridColumn
          headerName={t('Fee')}
          field="market.tradableInstrument.instrument.product"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            const asset = value.settlementAsset;
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
            const totalFees = addDecimalsFormatNumber(
              fee.toString(),
              asset.decimals
            );
            return `${totalFees} ${asset.symbol}`;
          }}
        />
        <AgGridColumn
          headerName={t('Date')}
          field="createdAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);
