import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import { PriceCell, t } from '@vegaprotocol/react-helpers';
import {
  AgGridDynamic as AgGrid,
  progressBarCellRendererSelector,
} from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { getId } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import type { AccountType } from '@vegaprotocol/types';
import {
  progressBarHeaderComponentParams,
  progressBarValueFormatter,
} from './accounts-table';

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  style?: CSSProperties;
}

export const BreakdownTable = forwardRef<AgGridReact, BreakdownTableProps>(
  ({ data }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No collateral breakdown')}
        rowData={data}
        getRowId={({ data }) => getId(data)}
        ref={ref}
        rowHeight={34}
        components={{ PriceCell }}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter="value || '—'"
          maxWidth={300}
        />
        <AgGridColumn
          headerName={t('Used')}
          field="used"
          flex={2}
          maxWidth={500}
          headerComponentParams={progressBarHeaderComponentParams}
          cellRendererSelector={progressBarCellRendererSelector}
          valueFormatter={progressBarValueFormatter}
        />
        <AgGridColumn
          headerName={t('Type')}
          field="type"
          maxWidth={300}
          valueFormatter={({ value }: ValueFormatterParams) =>
            AccountTypeMapping[value as AccountType]
          }
        />
      </AgGrid>
    );
  }
);

export default BreakdownTable;
