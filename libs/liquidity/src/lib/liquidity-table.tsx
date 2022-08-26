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
import BigNumber from 'bignumber.js';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';
import type { LiquidityProvision } from './liquidity-data-provider';
export interface LiquidityTableProps {
  data: LiquidityProvision[];
  decimalPlaces?: number;
  positionDecimalPlaces?: number;
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
        }}
        rowData={props.data}
        {...props}
      >
        <AgGridColumn headerName={t('Party')} field="party" />
        <AgGridColumn
          headerName={t('Commitment')}
          field="commitmentAmount"
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
          headerName={t('Share')}
          field="equityLikeShare"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return formatNumberPercentage(new BigNumber(value).times(100), 4);
          }}
        />
        <AgGridColumn
          headerName={t('Fee')}
          field="fee"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return formatNumberPercentage(new BigNumber(value).times(100));
          }}
        />
        <AgGridColumn
          headerName={t('Average entry valuation')}
          field="averageEntryValuation"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return addDecimalsFormatNumber(value, props.decimalPlaces);
          }}
        />
        <AgGridColumn
          headerName={t('Obligation (siskas)')}
          field="obligation"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return addDecimalsFormatNumber(value, props.decimalPlaces);
          }}
        />
        <AgGridColumn
          headerName={t('Supplied (siskas)')}
          field="supplied"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
            if (!value) {
              return value;
            }
            return addDecimalsFormatNumber(value, props.decimalPlaces);
          }}
        />
        <AgGridColumn
          headerName={t('Status')}
          field="status"
          valueFormatter={({ value }: { value: LiquidityProvisionStatus }) => {
            if (!value) {
              return value;
            }
            return LiquidityProvisionStatusMapping[value];
          }}
        />
        <AgGridColumn
          headerName={t('Created')}
          field="createdAt"
          type="rightAligned"
          valueFormatter={({ value }: { value: string }) => {
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
          valueFormatter={({ value }: { value: string }) => {
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
