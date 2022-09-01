import { forwardRef } from 'react';
import { dateValueFormatter, t } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type { LiquidityProvision } from './liquidity-data-provider';

export interface LiquidityTableProps {
  data: LiquidityProvision[];
}

export const LiquidityTable = forwardRef<AgGridReact, LiquidityTableProps>(
  (props, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate="No liquidity provisions"
        getRowId={({ data }) => data.party}
        rowHeight={34}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
          minWidth: 100,
        }}
        rowData={props.data}
        {...props}
      >
        <AgGridColumn headerName={t('Party')} field="party" />
        <AgGridColumn
          headerName={t('Commitment')}
          field="commitmentAmount"
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Share')}
          field="equityLikeShare"
          type="rightAligned"
        />
        <AgGridColumn headerName={t('Fee')} field="fee" type="rightAligned" />
        <AgGridColumn
          headerName={t('Average entry valuation')}
          field="averageEntryValuation"
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Obligation (siskas)')}
          field="obligation"
          type="rightAligned"
        />
        <AgGridColumn
          headerName={t('Supplied (siskas)')}
          field="supplied"
          type="rightAligned"
        />
        <AgGridColumn headerName={t('Status')} field="status" />
        <AgGridColumn
          headerName={t('Created')}
          field="createdAt"
          type="rightAligned"
          valueFormatter={dateValueFormatter}
        />
        <AgGridColumn
          headerName={t('Updated')}
          field="updatedAt"
          type="rightAligned"
          valueFormatter={dateValueFormatter}
        />
      </AgGrid>
    );
  }
);

export default LiquidityTable;
