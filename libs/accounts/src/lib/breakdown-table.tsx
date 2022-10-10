import { forwardRef } from 'react';
import {
  addDecimalsFormatNumber,
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';
import {
  AgGridDynamic as AgGrid,
  progressBarCellRendererSelector,
} from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import {
  progressBarHeaderComponentParams,
  progressBarValueFormatter,
} from './accounts-table';

interface BreakdownTableProps extends AgGridReactProps {
  data: AccountFields[] | null;
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
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<AccountFields, 'type'>) =>
            AccountTypeMapping[value]
          }
        />
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<
            AccountFields,
            'market.tradableInstrument.instrument.name'
          >) => {
            if (!value) return '-';
            return value;
          }}
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
          headerName={t('Balance')}
          field="balance"
          valueFormatter={({
            value,
            data,
          }: VegaValueFormatterParams<AccountFields, 'balance'>) => {
            if (data && data.asset) {
              return addDecimalsFormatNumber(value, data.asset.decimals);
            }
            return '-';
          }}
          maxWidth={300}
        />
      </AgGrid>
    );
  }
);

export default BreakdownTable;
