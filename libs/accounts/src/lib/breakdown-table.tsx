import { forwardRef } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import type {
  ValueProps,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { progressBarCellRendererSelector } from '@vegaprotocol/datagrid';
import { AgGridDynamic as AgGrid, PriceCell } from '@vegaprotocol/datagrid';
import type { ValueFormatterParams } from 'ag-grid-community';
import { accountValuesComparator } from './accounts-table';

export const progressBarValueFormatter = ({
  data,
  node,
}: ValueFormatterParams): ValueProps['valueFormatted'] | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.used);
  const mid = BigInt(data.available);
  const max = BigInt(data.total);
  const range = max > min ? max : min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.asset.decimals),
    high: addDecimalsFormatNumber(mid.toString(), data.asset.decimals),
    value: range ? Number((min * BigInt(100)) / range) : 0,
    intent: Intent.Warning,
  };
};

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
          sortable: true,
        }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<
            AccountFields,
            'market.tradableInstrument.instrument.name'
          >) => {
            if (!value) return 'None';
            return value;
          }}
          minWidth={200}
        />
        <AgGridColumn
          headerName={t('Account type')}
          field="type"
          maxWidth={300}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<AccountFields, 'type'>) =>
            value
              ? AccountTypeMapping[value as keyof typeof AccountTypeMapping]
              : ''
          }
        />

        <AgGridColumn
          headerName={t('Balance')}
          field="used"
          flex={2}
          maxWidth={500}
          cellRendererSelector={progressBarCellRendererSelector}
          valueFormatter={progressBarValueFormatter}
          comparator={accountValuesComparator}
        />
      </AgGrid>
    );
  }
);

export default BreakdownTable;
