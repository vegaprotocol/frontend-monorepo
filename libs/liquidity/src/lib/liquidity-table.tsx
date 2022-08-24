/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react';
import { getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type {
  Liquidity_market_liquidityProvisionsConnection_edges,
  Liquidity_market_liquidityProvisionsConnection_edges_node,
} from './__generated__';

export const getId = (
  data: Liquidity_market_liquidityProvisionsConnection_edges_node
) => data.id;

export interface LiquidityTableProps {
  data: (Liquidity_market_liquidityProvisionsConnection_edges | null)[];
}

export const LiquidityTable = forwardRef<AgGridReact, LiquidityTableProps>(
  (props, ref) => {
    console.log('liquidityProvisionsConnectionsTable', props);
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
        {...props}
      >
        <AgGridColumn
          headerName={t('Created')}
          field="createdAt"
          type="rightAligned"
          valueFormatter={({ value }: any) => {
            if (!value) {
              return value;
            }
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          headerName={t('Created')}
          field="createdAt"
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
          field="updatedAt"
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
