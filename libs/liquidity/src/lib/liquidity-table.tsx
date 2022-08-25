/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type {
  Liquidity_market_liquidityProvisionsConnection_edges,
  Liquidity_market_liquidityProvisionsConnection_edges_node,
} from './__generated__';
import BigNumber from 'bignumber.js';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';

export const getId = (
  data: Liquidity_market_liquidityProvisionsConnection_edges_node
) => data.id;

export interface LiquidityTableProps {
  data: (Liquidity_market_liquidityProvisionsConnection_edges | null)[];
  decimalPlaces?: number;
  positionDecimalPlaces?: number;
}

export const LiquidityTable = forwardRef<AgGridReact, LiquidityTableProps>(
  (props, ref) => {
    console.log('liquidityProvisionsConnectionsTable', { data: props.data });
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate="No liquidity provisions"
        getRowId={({ data }) => data.node.party.id}
        rowHeight={34}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
        rowData={props.data}
        {...props}
      >
        <AgGridColumn headerName={t('Party')} field="node.party.id" />
        <AgGridColumn
          headerName={t('Commitment amount')}
          field="node.commitmentAmount"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return addDecimalsFormatNumber(
              value,
              props.positionDecimalPlaces ?? 0
            );
          }}
        />
        <AgGridColumn
          headerName={t('Status')}
          field="node.status"
          valueFormatter={({ value }: { value: LiquidityProvisionStatus }) => {
            if (!value) {
              return value;
            }
            return LiquidityProvisionStatusMapping[value];
          }}
        />
        <AgGridColumn
          headerName={t('Fee')}
          field="node.fee"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return formatNumberPercentage(new BigNumber(value).times(100));
          }}
        />
        <AgGridColumn
          headerName={t('Created')}
          field="node.createdAt"
          type="rightAligned"
          valueFormatter={({ value }: any) => {
            if (!value) {
              return value;
            }
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          headerName={t('Updated')}
          field="node.updatedAt"
          type="rightAligned"
          valueFormatter={({ value }: any) => {
            if (!value) {
              return value;
            }
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);

export default LiquidityTable;
