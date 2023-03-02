import { forwardRef } from 'react';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Intent,
  progressBarCellRendererSelector,
} from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import type { AccountFields } from './accounts-data-provider';
import { AccountTypeMapping } from '@vegaprotocol/types';
import type { ValueProps } from '@vegaprotocol/ui-toolkit';
import type { VegaValueFormatterParams } from '@vegaprotocol/datagrid';
import { AgGridDynamic as AgGrid, PriceCell } from '@vegaprotocol/datagrid';
import type { ValueFormatterParams } from 'ag-grid-community';

export const progressBarValueFormatter = ({
  data,
  node,
}: ValueFormatterParams): ValueProps['valueFormatted'] | undefined => {
  if (!data || node?.rowPinned) {
    return undefined;
  }
  const min = BigInt(data.used);
  const mid = BigInt(data.available);
  const max = BigInt(data.deposited);
  const range = max > min ? max : min;
  return {
    low: addDecimalsFormatNumber(min.toString(), data.asset.decimals, 4),
    high: addDecimalsFormatNumber(mid.toString(), data.asset.decimals, 4),
    value: range ? Number((min * BigInt(100)) / range) : 0,
    intent: Intent.Warning,
  };
};

export const progressBarHeaderComponentParams = {
  template:
    '<div class="ag-cell-label-container" role="presentation">' +
    `  <span>${t('Available')}</span>` +
    '  <span ref="eText" class="ag-header-cell-text"></span>' +
    '</div>',
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
        }}
      >
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
            if (data && data.asset && isNumeric(value)) {
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
