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
import { AccountTypeMapping } from '@vegaprotocol/types';
import type { AccountType } from '@vegaprotocol/types';
import {
  assetDecimalsFormatter,
  progressBarHeaderComponentParams,
  progressBarValueFormatter,
} from './accounts-table';

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
  style?: CSSProperties;
}

const BreakdownTable = forwardRef<AgGridReact, BreakdownTableProps>(
  ({ data }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('Collateral not used')}
        rowData={data}
        getRowId={({ data }: { data: AccountFields }) =>
          `${data.asset.id}-${data.type}-${data.market?.id}`
        }
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
          headerName={t('Account type')}
          field="type"
          maxWidth={300}
          valueFormatter={({ value }: ValueFormatterParams) =>
            AccountTypeMapping[value as AccountType]
          }
        />
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter="value || '—'"
          minWidth={200}
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
          headerName={t('Deposited')}
          field="deposited"
          valueFormatter={assetDecimalsFormatter}
          maxWidth={300}
        />
        <AgGridColumn
          headerName={t('Balance')}
          field="balance"
          valueFormatter={assetDecimalsFormatter}
          maxWidth={300}
        />
      </AgGrid>
    );
  }
);

export default BreakdownTable;
