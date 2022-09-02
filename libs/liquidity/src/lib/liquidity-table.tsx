import { forwardRef } from 'react';
import {
  addDecimalsFormatNumber,
  dateValueFormatter,
  formatNumberPercentage,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type { LiquidityProvision } from './liquidity-data-provider';
import type { ValueFormatterParams } from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';

const assetDecimalsFormatter = ({ value, data }: ValueFormatterParams) => {
  if (!value) return '-';
  return addDecimalsFormatNumber(value, data.assetDecimalPlaces);
};

const percentageFormatter = ({ value }: ValueFormatterParams) => {
  if (!value) return '-';
  return formatNumberPercentage(new BigNumber(value).times(100), 4) || '-';
};

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
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Share')}
          field="equityLikeShare"
          type="rightAligned"
          valueFormatter={percentageFormatter}
        />
        <AgGridColumn
          headerName={t('Fee')}
          field="fee"
          type="rightAligned"
          valueFormatter={percentageFormatter}
        />
        <AgGridColumn
          headerName={t('Average entry valuation')}
          field="averageEntryValuation"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Obligation (siskas)')}
          field="obligation"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Supplied (siskas)')}
          field="supplied"
          type="rightAligned"
          valueFormatter={assetDecimalsFormatter}
        />
        <AgGridColumn
          headerName={t('Status')}
          field="status"
          valueFormatter={({ value }: { value: LiquidityProvisionStatus }) => {
            if (!value) return value;
            return LiquidityProvisionStatusMapping[value];
          }}
        />
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
